const line = '[download]   0.0% of   13.46MiB at   50.37KiB/s ETA 04:33';
const regex = /(?:\s|^|\[)(\d{1,3}(?:\.\d+)?)%/g;
const matches = [...line.matchAll(regex)];

console.log(`Line: "${line}"`);
console.log(`Regex: ${regex}`);
console.log(`Matches found: ${matches.length}`);

if (matches.length > 0) {
    matches.forEach((m, i) => {
        console.log(`Match ${i}: full="${m[0]}", group1="${m[1]}"`);
    });
} else {
    console.log('NO MATCHES');
}
