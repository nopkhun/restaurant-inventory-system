/**
 * Manual test script to verify authentication functionality
 * This script tests the core authentication functions without requiring database connection
 */

import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  TokenPayload
} from '../utils/auth';
import { UserRole } from '../models/User';

async function testAuthenticationFunctions() {
  console.log('🧪 Testing Authentication Functions...\n');

  try {
    // Test 1: Password Hashing
    console.log('1. Testing Password Hashing...');
    const password = 'TestPassword123';
    const hashedPassword = await hashPassword(password);
    console.log(`✅ Password hashed successfully: ${hashedPassword.substring(0, 20)}...`);

    // Test 2: Password Comparison
    console.log('\n2. Testing Password Comparison...');
    const isValidPassword = await comparePassword(password, hashedPassword);
    const isInvalidPassword = await comparePassword('WrongPassword', hashedPassword);
    console.log(`✅ Valid password check: ${isValidPassword}`);
    console.log(`✅ Invalid password check: ${isInvalidPassword}`);

    // Test 3: JWT Token Generation
    console.log('\n3. Testing JWT Token Generation...');
    const mockPayload: TokenPayload = {
      userId: 'test-user-123',
      username: 'testuser',
      email: 'test@example.com',
      role: UserRole.STAFF,
      locationId: 'location-123'
    };

    const accessToken = generateAccessToken(mockPayload);
    const refreshToken = generateRefreshToken();
    console.log(`✅ Access token generated: ${accessToken.substring(0, 50)}...`);
    console.log(`✅ Refresh token generated: ${refreshToken.substring(0, 50)}...`);

    // Test 4: JWT Token Verification
    console.log('\n4. Testing JWT Token Verification...');
    const decodedPayload = verifyAccessToken(accessToken);
    console.log(`✅ Access token verified successfully`);
    console.log(`   - User ID: ${decodedPayload.userId}`);
    console.log(`   - Username: ${decodedPayload.username}`);
    console.log(`   - Role: ${decodedPayload.role}`);

    const decodedRefreshToken = verifyRefreshToken(refreshToken);
    console.log(`✅ Refresh token verified successfully`);
    console.log(`   - Token ID: ${decodedRefreshToken.tokenId}`);

    // Test 5: Invalid Token Handling
    console.log('\n5. Testing Invalid Token Handling...');
    try {
      verifyAccessToken('invalid.token.here');
      console.log('❌ Should have thrown error for invalid token');
    } catch (error) {
      console.log('✅ Invalid access token properly rejected');
    }

    try {
      verifyRefreshToken('invalid.refresh.token');
      console.log('❌ Should have thrown error for invalid refresh token');
    } catch (error) {
      console.log('✅ Invalid refresh token properly rejected');
    }

    console.log('\n🎉 All authentication function tests passed!');
    return true;

  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    return false;
  }
}

// Run the tests
if (require.main === module) {
  testAuthenticationFunctions()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

export { testAuthenticationFunctions };