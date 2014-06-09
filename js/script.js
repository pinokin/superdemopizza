$(function () {

    // Set the initial components of the page
    //populateMenu(); // Only getting [object Object]
    NormalState();
    adjustStyle($(this).width());
    $(window).resize(function () {
        adjustStyle($(this).width());
    });


    // Add to cart functionality
    $('#pizza_menu .add_to_cart').click(function () {
        addToCart(this);
    });

    // Checkout functionality
    $('#shopping_cart .checkout').click(function () {
        checkout();
    });

    // Validate the order form and if successful, place the order
    $('#checkout .place_order').click(function () {
        $('#order_form').validate({
            submitHandler: function (form) {
                placeOrder();
            },
            invalidHandler: function (event, validator) {
                $('#order_form .form-control.error').parent().addClass('has-error');
            }
        });
    });

    // Confirm the order (i.e. return to the front page)
    $('#order_confirmation .complete_order').click(function () {
        goToFrontPage();
    });

    // Cancel order
    $('.cancel_order').click(function () {
        cancelOrder();
    });

    // Order history
    $('#show_order_history').click(function () {
        showOrderHistory();
    });
}
)

// Actions
function populateMenu() {
    $.getJSON("data/data.js", function (data) {
        var menuItems = [];
        var buttonHtml = "<span class='button add_to_cart'>Add to cart</span>";
        $.each(data.pizzas, function (key, val) {
            menuItems.push("<li><div class='pizza'><h4>" + val + "</h4>" + buttonHtml + "</div></li>");
        });
        $('#pizza_menu ul').append(menuItems.join(""));
    })
    .fail(function () {
        alert('Error retrieving pizzas!');
    });
}

function addToCart(selectedItem) { 

    // Get the selected menu item
    var itemToAdd = $(selectedItem).parent().html();

    // Add the new menu item to the cart
    $('#shopping_cart_items').append('<li>' + itemToAdd + '</li>');
    $('#empty_cart').addClass('hide');

    // Hide the "Add to cart" button of the item on the cart
    $('#shopping_cart .add_to_cart').addClass('hide');

    // Set the count of items in the shopping cart
    var itemCount = $('#shopping_cart li').length - 1; // The "1" is the "empty cart" item
    $('#shopping_cart h3').text('Shopping Cart (' + itemCount + ')')

    setShoppingCartHeader();
}

function setShoppingCartHeader() { 
    // Set the count of items in the shopping cart
    var itemCount = $('#shopping_cart li').length - 1; // The "1" is the "empty cart" item
    $('#shopping_cart h3').text('Shopping Cart (' + itemCount + ')')
}

function checkout() {
    CheckoutState(); 
}

function placeOrder() {
    OrderConfirmationState();
    $('#confirmed_delivery_address').empty().append(function () {
        var deliveryAddress =
            $('#name').val() + '<br />' +
            $('#address').val() + '<br />' +
            $('#zip').val() + ' ' + $('#city').val() + '<br />' +
            $('#phone').val() + '<br />' +
            'Confirmation will be sent to: ' + $('#email').val() + '<br />' +
            'Note: ' + $('#note').val();
        return deliveryAddress;
    });
}

function orderCompleted() {
    NormalState();
}

function cancelOrder() {
    NormalState();
}

function goToFrontPage() {
    NormalState();
}

// Different states of the page (Normal, OrderForm, OrderConfirmation)
function NormalState() {
    showMenu(true);
    showShoppingCart(true);
    showCheckout(false);
    showOrderConfirmation(false);
    $('#page').addClass('normal_state').removeClass('checkout_state order_confirmation_state');
    $('#shopping_cart').addClass('side_content').removeClass('full_content');
    setShoppingCartHeader();
}

function CheckoutState() {
    showMenu(false);
    showShoppingCart(true);
    showCheckout(true);
    showOrderConfirmation(false);
    $('#page').addClass('checkout_state').removeClass('normal_state order_confirmation_state');
    // On checkout page, show the shopping cart in full width before the form
    $('#shopping_cart').addClass('full_content').removeClass('side_content');
    $('#shopping_cart h3').text('This is what you are about to order:');
}

function OrderConfirmationState() {
    showMenu(false);
    showShoppingCart(true);
    showCheckout(false);
    showOrderConfirmation(true);
    $('#page').addClass('order_confirmation_state').removeClass('normal_state checkout_state');
    // On order confirmation page, show the shopping cart in full width before the form
    $('#shopping_cart').addClass('full_content').removeClass('side_content');
    $('#shopping_cart h3').text('This is what you just ordered:');}

// Showing and hiding different sections
function showMenu(show) {
    if (show == true) $('#pizza_menu').removeClass('hide');
    else $('#pizza_menu').addClass('hide');
}

function showShoppingCart(show) {
    if (show == true) $('#shopping_cart').removeClass('hide');
    else $('#shopping_cart').addClass('hide');
}

function showCheckout(show) {
    if (show == true) $('#checkout').removeClass('hide');
    else $('#checkout').addClass('hide');
}

function showOrderConfirmation(show) {
    if (show == true) $('#order_confirmation').removeClass('hide');
    else $('#order_confirmation').addClass('hide');
}

function showOrderHistory() {
    var orderHistory = $('#order_history .history_data').toggleClass('hide');
    var showOrderHistoryLink = $('#show_order_history');
    if (orderHistory.hasClass('hide')) {
        showOrderHistoryLink.text('Show order history');
    }
    else { 
        showOrderHistoryLink.text('Hide order history'); 
    }
}

// For narrow displays add a class to act upon
function adjustStyle(width) {
    width = parseInt(width);
    if (width < 701) {
        $('#page').addClass('narrow');
    } 
    else {
        $('#page').removeClass('narrow');
    }
}

function setNarrowShoppingCart() {
    var narrowShoppingCart = $('.narrow #shopping_cart');
}