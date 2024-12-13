document.addEventListener('DOMContentLoaded', function() {
    var uniqueURL = document.getElementById('uniqueURL');
    uniqueURL.href = window.location.href;
    uniqueURL.textContent = window.location.href;

    document.getElementById('copyButton').addEventListener('click', function () {
        // Copy to clipboard logic
        var textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        // Toggle icons
        var clipboardIcon = document.getElementById('clipboardIcon');
        var checkIcon = document.getElementById('checkIcon');

        clipboardIcon.style.display = 'none';
        checkIcon.style.display = 'inline';

        // After a delay, revert the icons
        setTimeout(function () {
            clipboardIcon.style.display = 'inline';
            checkIcon.style.display = 'none';
        }, 2000);  // The icon will revert back after 2 seconds
    });
});