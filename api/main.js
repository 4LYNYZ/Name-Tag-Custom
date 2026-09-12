module.exports = (req, res) => {
    // Cek User-Agent (pengenal perangkat yang nge-request link)
    const userAgent = req.headers['user-agent'] || '';

    // Apakah yang akses browser biasa? (biasanya ada kata "Mozilla", "Chrome", "Safari")
    const isBrowser = userAgent.includes("Mozilla") || userAgent.includes("Chrome") || userAgent.includes("Safari");

    if (isBrowser) {
        // Kalau dibuka di browser, alihkan ke halaman web biasa (penutup)
        res.writeHead(302, { Location: '/index.html' });
        res.end();
    } else {
        // Kalau di-execute lewat game (Executor Roblox / Synapse / Delta / dll)
        // Masukkan script Lua asli lu di sini (bebas mau di-obfuscate atau enggak, karena aman di server)
        const luaScript = `
-- Script Lua Asli Lu di sini
print("Script berhasil dimuat dari server aman!")
        `;

        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(luaScript);
    }
};
