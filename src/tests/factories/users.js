import factoryGirl from 'factory-girl'
import bluebird from 'bluebird'
import faker from 'faker'
const factory = factoryGirl.promisfy(bluebird);

import { User, Student, Recruiter, Admin} from '../../api/models/users.js'

let user = {
    name: faker.name.findName(),
    email: faker.internet.findEmail(),
    created_by: Date.now()
}
factory.define('user', User, user);