// backend/scripts/seedLocations.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Division, District, Upazila, Area } = require('../models/Location');

dotenv.config();

const seedLocations = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/boguratoo';
    await mongoose.connect(mongoUri);
    console.log('[INFO] Connected to MongoDB for Location Seeding...');

    // ১. বাংলাদেশের ৮টি বিভাগ
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

    for (const div of divisionsData) {
      await Division.findOneAndUpdate({ name: div.name }, div, { upsert: true });
    }
    console.log('✅ 8 Divisions seeded.');

    const rajshahiDiv = await Division.findOne({ name: 'Rajshahi' });

    // ২. বগুড়া জেলা
    const boguraDistrict = await District.findOneAndUpdate(
      { name: 'Bogura', division: rajshahiDiv._id },
      { name: 'Bogura', bnName: 'বগুড়া', division: rajshahiDiv._id },
      { upsert: true, new: true }
    );
    console.log('✅ Bogura District seeded.');

    // ৩. বগুড়া জেলার ১২টি উপজেলা
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
    for (const upz of upazilasData) {
      const created = await Upazila.findOneAndUpdate(
        { name: upz.name, district: boguraDistrict._id },
        { ...upz, district: boguraDistrict._id },
        { upsert: true, new: true }
      );
      upazilaMap[upz.name] = created._id;
    }
    console.log('✅ 12 Upazilas of Bogura seeded.');

    // ৪. বগুড়া সদরের প্রধান প্রধান এলাকা / পাড়া-মহল্লা
    const boguraSadarId = upazilaMap['Bogura Sadar'];
    const areasData = [
      { name: 'Jaleshwaritola', bnName: 'জলেশ্বরীতলা' },
      { name: 'Thanthania', bnName: 'ঠনঠনিয়া' },
      { name: 'Sutrapur', bnName: 'সূত্রাপুর' },
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
      { name: 'Erulia', bnName: 'এরুলিয়া' },
    ];

    for (const area of areasData) {
      await Area.findOneAndUpdate(
        { name: area.name, upazila: boguraSadarId },
        { ...area, upazila: boguraSadarId, district: boguraDistrict._id },
        { upsert: true }
      );
    }
    console.log(`✅ ${areasData.length} Areas of Bogura Sadar seeded successfully!`);
    console.log('--------------------------------------------------');
    console.log('🎉 Location Seeding Completed!');

    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Location seeding failed:', error.message);
    process.exit(1);
  }
};

seedLocations();
