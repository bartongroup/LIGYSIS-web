$(document).ready(function() {
    $('#selectSegment').on('change', function() {
        var selectedValue = $(this).val();
        if (selectedValue) {
            //console.log(window.location.href); // Log the current URL
            //console.log(selectedValue); // Log the selected value
            window.location.href = window.appBaseUrl + selectedValue; // Redirect to the selected page (structural segment)
        }
    });
});