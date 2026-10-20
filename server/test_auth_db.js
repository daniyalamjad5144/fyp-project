require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function testFullAuthFlow() {
    console.log('==============================================');
    console.log('🧪 TESTING MONGODB ATLAS AUTHENTICATION FLOW');
    console.log('==============================================');

    const uri = process.env.MONGO_URI;
    console.log(`📡 Connecting to MongoDB Atlas URI: ${uri.replace(/:([^:@]+)@/, ':****@')}`);

    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
        console.log('✅ Successfully connected to MongoDB Atlas!');
        console.log(`   Host: ${mongoose.connection.host}`);
        console.log(`   Database: ${mongoose.connection.name}`);

        const testEmail = 'daniyal.student@example.com';
        const testPassword = 'Password123!';

        // 1. Clean previous test record if exists
        await User.deleteOne({ email: testEmail });
        console.log('\n--- Step 1: Pre-check non-existent user ---');
        let checkUser = await User.findOne({ email: testEmail });
        console.log(`Check before registration: User exists? ${!!checkUser}`);

        // 2. Register user (Save to database)
        console.log('\n--- Step 2: Register user (Save to DB) ---');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(testPassword, salt);
        const newUser = new User({
            name: 'Daniyal Student',
            email: testEmail,
            password: hashedPassword,
            role: 'learner'
        });
        const savedUser = await newUser.save();
        console.log(`✅ User saved to DB with ID: ${savedUser._id}`);

        // 3. Verify user in database
        console.log('\n--- Step 3: Verify user directly from DB ---');
        const fetchedUser = await User.findOne({ email: testEmail });
        if (!fetchedUser) {
            throw new Error('❌ Verification failed: User was not found in DB after save!');
        }
        console.log(`✅ User verified in MongoDB Atlas:`);
        console.log(`   ID: ${fetchedUser._id}`);
        console.log(`   Name: ${fetchedUser.name}`);
        console.log(`   Email: ${fetchedUser.email}`);
        console.log(`   Role: ${fetchedUser.role}`);

        // 4. Test authentication check (Login logic simulation)
        console.log('\n--- Step 4: Authentication Check ---');

        // Test non-existent user
        const fakeEmail = 'nonexistent.user999@example.com';
        const fakeCheck = await User.findOne({ email: fakeEmail });
        console.log(`Authentication test for '${fakeEmail}': Found in DB? ${!!fakeCheck} (Expected: false)`);

        // Test wrong password
        const wrongPasswordMatch = await bcrypt.compare('WrongPassword', fetchedUser.password);
        console.log(`Authentication test with wrong password: Password match? ${wrongPasswordMatch} (Expected: false)`);

        // Test correct password
        const correctPasswordMatch = await bcrypt.compare(testPassword, fetchedUser.password);
        console.log(`Authentication test with correct password: Password match? ${correctPasswordMatch} (Expected: true)`);

        if (correctPasswordMatch && !wrongPasswordMatch && !fakeCheck) {
            console.log('\n🎉 ALL AUTHENTICATION AND DATABASE CHECKS PASSED SUCCESSFULLY!');
        } else {
            console.error('\n❌ Some checks did not return expected results.');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Test failed with error:', err.message);
        process.exit(1);
    }
}

testFullAuthFlow();
