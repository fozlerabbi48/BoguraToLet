const Property = require('../models/Property');
const cloudinary = require('../config/cloudinary');

// multipart/form-data তে "false" স্ট্রিং আসে, তাই আলাদা হেলপার
const toBool = (v) => v === true || v === 'true' || v === '1' || v === 1;

// Helper: Cloudinary Upload buffer
const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: 'boguratolet/properties', resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve({ url: result.secure_url, publicId: result.public_id });
        }
      )
      .end(buffer);
  });

// @desc    Create new Property Advertisement
// @route   POST /api/v1/properties
const createProperty = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      rent,
      advancePayment,
      securityDeposit,
      bedrooms,
      bathrooms,
      balconies,
      floorNo,
      totalFloors,
      isFurnished,
      hasParking,
      gasType,
      electricityType,
      waterSupply,
      tenantPreference,
      availableFrom,
      contactPhone,
      division,
      district,
      upazila,
      area,
      addressDetails,
      specificAddress,
      address,
    } = req.body;

    // ছবি ঐচ্ছিক: না দিলে খালি অ্যারে থাকবে, কোনো ডিফল্ট ছবি বসবে না
    let propertyImages = [];

    if (req.files && req.files.length > 0) {
      try {
        for (let i = 0; i < req.files.length; i++) {
          const uploaded = await uploadToCloudinary(req.files[i].buffer);
          propertyImages.push({
            url: uploaded.url,
            publicId: uploaded.publicId,
            isCover: i === 0,
          });
        }
      } catch (uploadErr) {
        console.warn('Cloudinary upload failed, posting without images:', uploadErr.message);
        propertyImages = [];
      }
    }

    const property = await Property.create({
      title,
      description,
      category: category || 'Family House',
      rent: Number(rent),
      advancePayment: Number(advancePayment) || 0,
      securityDeposit: Number(securityDeposit) || 0,
      bedrooms: Number(bedrooms) || 1,
      bathrooms: Number(bathrooms) || 1,
      balconies: Number(balconies) || 0,
      floorNo: Number(floorNo) || 1,
      totalFloors: Number(totalFloors) || 1,
      isFurnished: toBool(isFurnished),
      hasParking: toBool(hasParking),
      gasType: gasType || 'None',
      electricityType: electricityType || 'Prepaid',
      waterSupply: waterSupply || '24 Hours',
      tenantPreference: tenantPreference || 'Any',
      availableFrom: availableFrom ? new Date(availableFrom) : new Date(),
      contactPhone,
      division,
      district,
      upazila,
      area,
      addressDetails: addressDetails || specificAddress || address,
      images: propertyImages,
      owner: req.user._id,
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Property advertisement published successfully!',
      data: property,
    });
  } catch (error) {
    console.error('Create property error:', error);
    next(error);
  }
};

// @desc    Get all properties with filtering, sorting, pagination
// @route   GET /api/v1/properties
const getProperties = async (req, res, next) => {
  try {
    const {
      category,
      district,
      upazila,
      area,
      tenantPreference,
      minRent,
      maxRent,
      bedrooms,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = { status: 'active' };

    if (category) query.category = category;
    if (district) query.district = district;
    if (upazila) query.upazila = upazila;
    if (area) query.area = area;
    if (tenantPreference) query.tenantPreference = tenantPreference;
    if (bedrooms) query.bedrooms = Number(bedrooms);

    if (minRent || maxRent) {
      query.rent = {};
      if (minRent) query.rent.$gte = Number(minRent);
      if (maxRent) query.rent.$lte = Number(maxRent);
    }

    // শুধু অনুমোদিত ফিল্ড দিয়ে সর্ট
    const allowedSort = ['createdAt', 'rent', 'viewCount'];
    const sortField = allowedSort.includes(sortBy) ? sortBy : 'createdAt';

    const skip = (Number(page) - 1) * Number(limit);

    const properties = await Property.find(query)
      .populate('owner', 'name phone isVerified profileImage')
      .populate('area', 'name bnName')
      .populate('upazila', 'name bnName')
      .populate('district', 'name bnName')
      .sort({ [sortField]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Property.countDocuments(query);

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single property details
// @route   GET /api/v1/properties/:id
const getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { returnDocument: 'after' }
    )
      .populate('owner', 'name phone email isVerified profileImage createdAt')
      .populate('area', 'name bnName')
      .populate('upazila', 'name bnName')
      .populate('district', 'name bnName');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.status(200).json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark property as Rented or change status
// @route   PATCH /api/v1/properties/:id/status
const updatePropertyStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const isOwner = property.owner.toString() === req.user._id.toString();
    const isAdmin = ['Super Admin', 'Admin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this property' });
    }

    property.status = status;
    await property.save();

    res.status(200).json({ success: true, message: `Status updated to ${status}`, data: property });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's own properties
// @route   GET /api/v1/properties/my/listings
const getMyProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ owner: req.user._id })
      .populate('area', 'name bnName')
      .populate('upazila', 'name bnName')
      .populate('district', 'name bnName')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all properties (pending, active, rented)
// @route   GET /api/v1/properties/admin/all
const getAdminProperties = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const properties = await Property.find(query)
      .populate('owner', 'name phone email role isVerified')
      .populate('area', 'name bnName')
      .populate('upazila', 'name bnName')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete property
// @route   DELETE /api/v1/properties/:id
const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const isOwner = property.owner.toString() === req.user._id.toString();
    const isAdmin = ['Super Admin', 'Admin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this property' });
    }

    // Cloudinary থেকেও ছবি মুছে ফেলা
    for (const img of property.images || []) {
      if (img.publicId) {
        try {
          await cloudinary.uploader.destroy(img.publicId);
        } catch (e) {
          console.warn('Cloudinary delete failed:', e.message);
        }
      }
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updatePropertyStatus,
  getMyProperties,
  getAdminProperties,
  deleteProperty,
};