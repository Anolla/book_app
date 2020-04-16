$(document).ready(function() {
    $(".bookForm").hide();
    $(".bookButton").on('click', function(e) {
        e.preventDefault();
        $(".bookForm").toggle();
        $('.deleteButton').hide();
        $('.bookButton').hide();
    })
})