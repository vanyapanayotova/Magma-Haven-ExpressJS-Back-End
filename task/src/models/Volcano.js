import { Schema, model, Types } from 'mongoose';

const volcanoSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Movie Title is required!'],
        minLength: 2,
        // validate: [/^[A-Za-z0-9 ]+$/, 'Title can contain only alpha numeric characters!'],
    },
    location: {
        type: String,
        required: true,
        minLength: 3,
        lowercase: true,
        // validate: [/^[A-Za-z0-9 ]+$/, 'Genre can contain only alpha numeric characters!'],
    },
    elevation: {
        type: Number,
        required: true,
        min: [0, 'The Elevation should be minimum 0m!'],
        // validate: [/^[A-Za-z0-9 ]+$/, 'Director can contain only alpha numeric characters!'],
        required: true
    },
    year: {
        type: Number,
        required: true,
        min: [0, 'The Year should be between 0 and 2024!'],
        max: [2024, 'The Year should be between 0 and 2024!'],
    },
    imageUrl: {
        type: String,
        required: true,
        validate: [/^https?:\/\//, 'Invalid image url!'],
    },
    volcanoType: {
        type: String,
        required: true,
        enum: [
            'Supervolcanoes',
            'Submarine',
            'Subglacial',
            'Mud',
            'Stratovolcanoes',
            'Shield'
        ]
    },
    description: {
        type: String,
        required: true,
        //validate: [/^[A-Za-z0-9/./, ]+$/, 'Description can contain only alpha numeric characters!'],
        minLength: [10, 'Description should be at least 10 characters long!']
    },
    owner: {
        type: Types.ObjectId,
        ref: 'User',
    },
    voteList: [{
        type: Types.ObjectId,
        ref: 'User'
    }]
    

});

const Volcano = model('Volcano', volcanoSchema);

export default Volcano;
