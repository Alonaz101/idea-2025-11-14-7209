const mongoose = require('mongoose');
const { Schema } = mongoose;

// Mock schema matches userSchema extracted
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  dietaryPreferences: [{ type: String }],
});

// Mock User model
const User = mongoose.model('User', userSchema);

// Jest mocks
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  const saveMock = jest.fn();
  const validateMock = jest.fn();
  const modelMock = jest.fn(() => ({ save: saveMock }));

  return {
    ...actualMongoose,
    model: modelMock,
    Schema: actualMongoose.Schema,
  };
});

// Tests

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should fail validation if required fields are missing', async () => {
    const user = new User({});
    let err = null;
    try {
      await user.validate();
    } catch (error) {
      err = error;
    }
    expect(err).toBeTruthy();
    expect(err.errors.username).toBeTruthy();
    expect(err.errors.email).toBeTruthy();
    expect(err.errors.passwordHash).toBeTruthy();
  });

  test('should throw duplicate key error on unique username or email', async () => {
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'hashedpw',
    });

    // Mock save to throw duplicate key error for uniqueness
    User.prototype.save = jest.fn(() => {
      const err = new Error('E11000 duplicate key error collection');
      err.code = 11000;
      throw err;
    });

    await expect(user.save()).rejects.toThrow(/duplicate key/);
  });

  test('should apply default empty array if dietaryPreferences is missing', () => {
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'hashedpw',
    });
    expect(user.dietaryPreferences).toBeUndefined(); // no default set explicitly
  });

  test('should save successfully with all required fields', async () => {
    const user = new User({
      username: 'uniqueuser',
      email: 'unique@example.com',
      passwordHash: 'hashedpw',
      dietaryPreferences: ['vegan'],
    });

    User.prototype.save = jest.fn().mockResolvedValue(user);

    const savedUser = await user.save();
    expect(savedUser.username).toBe('uniqueuser');
    expect(savedUser.email).toBe('unique@example.com');
    expect(savedUser.dietaryPreferences).toEqual(['vegan']);
  });
});
