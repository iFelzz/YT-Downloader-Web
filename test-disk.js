const checkDiskSpace = require('check-disk-space').default || require('check-disk-space');
const path = require('path');

console.log('Type of checkDiskSpace:', typeof checkDiskSpace);

const tempDir = path.join(__dirname, 'temp');
console.log('Checking dir:', tempDir);

checkDiskSpace(tempDir).then(space => {
    console.log('Space:', space);
}).catch(err => {
    console.error('Error:', err);
});
