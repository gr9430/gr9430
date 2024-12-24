// Function to dynamically load JavaScript files
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.type = "text/javascript";
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.body.appendChild(script);
    });
}

// Function to dynamically load HTML components
function loadHTML(targetId, filePath) {
    return fetch(filePath)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
            }
            return response.text();
        })
        .then((html) => {
            document.getElementById(targetId).innerHTML = html;
        });
}

// Load all scripts and components dynamically
(async function () {
    try {
        // Load dynamic HTML components (navbar and footer)
        await loadHTML("navbar", "components/navbar.html");
        await loadHTML("footer", "components/footer.html");

        // List of JavaScript files to load dynamically
        const scripts = [
            "assets/js/collapsible.js", // Collapsible functionality
            // Add other scripts as needed
        ];

        // Dynamically load all JavaScript files
        for (const src of scripts) {
            await loadScript(src);
            console.log(`${src} loaded successfully.`);
        }
    } catch (error) {
        console.error(`Error loading scripts or components: ${error.message}`);
    }
})();
