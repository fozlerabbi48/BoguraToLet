
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Division, District, Upazila, Area } = require('../models/Location');

dotenv.config();

const seedLocations = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/boguratoo';

    await mongoose.connect(mongoUri);

    console.log('[INFO] Connected to MongoDB for Location Seeding...');

    // 1. Bangladesh divisions
    const divisionsData = [
      { name: 'Rajshahi', bnName: 'রাজশাহী' },
      { name: 'Dhaka', bnName: 'ঢাকা' },
      { name: 'Chittagong', bnName: 'চট্টগ্রাম' },
      { name: 'Khulna', bnName: 'খুলনা' },
      { name: 'Barishal', bnName: 'বরিশাল' },
      { name: 'Sylhet', bnName: 'সিলেট' },
      { name: 'Rangpur', bnName: 'রংপুর' },
      { name: 'Mymensingh', bnName: 'ময়মনসিংহ' },
    ];

    for (const division of divisionsData) {
      await Division.findOneAndUpdate(
        { name: division.name },
        division,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log('8 divisions seeded.');

    // 2. Bogura district
    const rajshahiDiv = await Division.findOne({ name: 'Rajshahi' });

    if (!rajshahiDiv) {
      throw new Error('Rajshahi division not found');
    }

    const boguraDistrict = await District.findOneAndUpdate(
      { name: 'Bogura', division: rajshahiDiv._id },
      {
        name: 'Bogura',
        bnName: 'বগুড়া',
        division: rajshahiDiv._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('Bogura district seeded.');

    // 3. Bogura district upazilas
    const upazilasData = [
      { name: 'Bogura Sadar', bnName: 'বগুড়া সদর' },
      { name: 'Shajahanpur', bnName: 'শাজাহানপুর' },
      { name: 'Sherpur', bnName: 'শেরপুর' },
      { name: 'Shibganj', bnName: 'শিবগঞ্জ' },
      { name: 'Gabtali', bnName: 'গাবতলী' },
      { name: 'Sonatala', bnName: 'সোনাতলা' },
      { name: 'Dhunat', bnName: 'ধুনট' },
      { name: 'Sariakandi', bnName: 'সারিয়াকান্দি' },
      { name: 'Nandigram', bnName: 'নন্দীগ্রাম' },
      { name: 'Adamdighi', bnName: 'আদমদীঘি' },
      { name: 'Dupchanchia', bnName: 'দুপচাঁচিয়া' },
      { name: 'Kahaloo', bnName: 'কাহালু' },
    ];

    const upazilaMap = {};

    for (const upazila of upazilasData) {
      const savedUpazila = await Upazila.findOneAndUpdate(
        {
          name: upazila.name,
          district: boguraDistrict._id,
        },
        {
          ...upazila,
          district: boguraDistrict._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      upazilaMap[upazila.name] = savedUpazila._id;
    }

    console.log('12 Bogura upazilas seeded.');

    // 4. Bogura Sadar areas
    const boguraSadarId = upazilaMap['Bogura Sadar'];

    const areasData = [
      { name: 'Satmatha', bnName: 'সাতমাথা' },
      { name: 'Raja Bazar', bnName: 'রাজা বাজার' },
      { name: 'Fateh Ali Bazar', bnName: 'ফতেহ আলী বাজার' },
      { name: 'Jaleshwaritola', bnName: 'জলেশ্বরীতলা' },
      { name: 'Thanthania', bnName: 'ঠনঠনিয়া' },
      { name: 'Thanthania Notun Para', bnName: 'ঠনঠনিয়া নতুন পাড়া' },
      { name: 'Sutrapur', bnName: 'সূত্রাপুর' },
      { name: 'Chaksutrapur', bnName: 'চকসূত্রাপুর' },
      { name: 'Malotinagar', bnName: 'মালতীনগর' },
      { name: 'Bonani', bnName: 'বনানী' },
      { name: 'Colony', bnName: 'কলোনী' },
      { name: 'Charmatha', bnName: 'চারমাথা' },
      { name: 'Nishindhara', bnName: 'নিশিন্দারা' },
      { name: 'Station Road', bnName: 'স্টেশন রোড' },
      { name: 'Fulbari', bnName: 'ফুলবাড়ী' },
      { name: 'Barogola', bnName: 'বড়গোলা' },
      { name: 'Katnarpara', bnName: 'কাটনারপাড়া' },
      { name: 'Rahman Nagar', bnName: 'রহমান নগর' },
      { name: 'Chelopara', bnName: 'চেলোপাড়া' },
      { name: 'Nawabbari Road', bnName: 'নওয়াববাড়ী রোড' },
      { name: 'Sherpur Road', bnName: 'শেরপুর রোড' },
      { name: 'Jhawtola', bnName: 'ঝাউতলা' },
      { name: 'New Market', bnName: 'নিউ মার্কেট' },
      { name: 'Thana Road', bnName: 'থানা রোড' },
      { name: 'Kazi Nazrul Islam Road', bnName: 'কাজী নজরুল ইসলাম সড়ক' },
      { name: 'Yakubia Mor', bnName: 'ইয়াকুবিয়া মোড়' },
      { name: 'Namajgor', bnName: 'নামাজগড়' },
      { name: 'Mofiz Paglar Mor', bnName: 'মফিজ পাগলার মোড়' },
      { name: 'Dattabari', bnName: 'দত্তবাড়ী' },
      { name: 'Badurtola', bnName: 'বাদুড়তলা' },
      { name: 'Seujgari', bnName: 'সেউজগাড়ী' },
      { name: 'Shibbati', bnName: 'শিববাটি' },
      { name: 'Khandar', bnName: 'খান্দার' },
      { name: 'Uposhohor', bnName: 'উপশহর' },
      { name: 'Matidali', bnName: 'মাটিডালী' },
      { name: 'Helenchapara', bnName: 'হেলেঞ্চাপাড়া' },
      { name: 'Kamargari', bnName: 'কামারগাড়ী' },
      { name: 'Jhopgari', bnName: 'ঝোপগাড়ী' },
      { name: 'Malgram', bnName: 'মালগ্রাম' },
      { name: 'Naruli', bnName: 'নারুলী' },
      { name: 'Garamara', bnName: 'গাড়ামারা' },
      { name: 'Latifpur', bnName: 'লতিফপুর' },
      { name: 'Phuldighi', bnName: 'ফুলদিঘী' },
      { name: 'Betgari', bnName: 'বেতগাড়ী' },
      { name: 'Chakbrindaban', bnName: 'চকবৃন্দাবন' },
      { name: 'Runner City', bnName: 'রানার সিটি' },
      { name: 'Karatoa Residential Area', bnName: 'করতোয়া আবাসিক এলাকা' },
      { name: 'Snigdha Residential Area', bnName: 'স্নিগ্ধা আবাসিক এলাকা' },
      { name: 'Mohonpur', bnName: 'মোহনপুর' },
      { name: 'Chok Alam', bnName: 'চক আলম' },
      { name: 'Erulia', bnName: 'এরুলিয়া' },
    ];

    for (const area of areasData) {
      await Area.findOneAndUpdate(
        {
          name: area.name,
          upazila: boguraSadarId,
        },
        {
          ...area,
          upazila: boguraSadarId,
          district: boguraDistrict._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    const totalAreas = await Area.countDocuments({
      upazila: boguraSadarId,
    });

    console.log(`${totalAreas} Bogura Sadar areas available in database.`);
    console.log('------------------------------------------');
    console.log('Location seeding completed successfully!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Location seeding failed:', error);

    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

seedLocations();
