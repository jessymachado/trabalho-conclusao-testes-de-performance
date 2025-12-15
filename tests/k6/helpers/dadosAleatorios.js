import faker from 'k6/x/faker';

export function randomName() {
    return `User_${Math.random().toString(36).substring(2, 8)}`;
}

export function randomPhone() {
    return faker.person.phone()
}
