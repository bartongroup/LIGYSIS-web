$(document).ready(function() {
    $('#selectSegment').on('change', function() {
        var selectedValue = $(this).val();
        if (selectedValue) {
        window.location.href = selectedValue; // Redirect to the selected page (structural segment)
        }
    });
});