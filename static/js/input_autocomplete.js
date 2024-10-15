$( function() {
    $( "#autocomplete" ).autocomplete({
        minLength: 1,
        source: proteinIds,
    });
    // Overrides the default autocomplete filter function to search only from the beginning of the string
    $.ui.autocomplete.filter = function (array, term) {
        var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(term), "i");
        return $.grep(array, function (value) {
            return matcher.test(value.label || value.value || value);
        });
    };
} );

// submits example UniProt ID in case no ID is introduced by the user

document.getElementById('UniProtIdSubmit').addEventListener('click', function(event) {
    var inputField = document.getElementById('autocomplete');
    if (inputField.value === '') {
        inputField.value = inputField.placeholder;
    }
});

document.getElementById('jobIdSubmit').addEventListener('click', function(event) {
    var inputField = document.getElementById('autocompleteJobId');
    if (inputField.value === '') {
        inputField.value = inputField.placeholder;
    }
});