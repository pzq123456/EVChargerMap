// 计算数据的hash值
async function calculateHash(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// 示例调用
const data = "Hello, this is a test data.";
calculateHash(data).then(hash => {
    console.log("Hash值:", hash);
});

