var itemsOnPage = 0;

$(function () {

	// Set the initial components of the page
	populateMenu();
	setCheckoutAccessibility();
	NormalState();
	adjustStyle($(window).width());
	$(window).resize(function () {
		adjustStyle($(this).width());
	});


	// Cart functionality
	$('.add_to_cart').click(function () {
		addToCart(this);
	});

	$('.remove_from_cart').click(function () {
		deleteFromCart(this);
	});

	$('.clear_cart').click(function () {
		clearCart();
	});

	// Checkout functionality
	$('#shopping_cart .checkout').click(function () {
		if ($(this).hasClass('disabled')) return;
		checkout();
	});

	// Validate the order form and if successful, place the order
	$('#checkout .place_order').click(function () {
		placeOrder();
	});

	// Confirm the order (i.e. return to the front page)
	$('#order_confirmation .complete_order').click(function () {
		returnToFrontPage(true);
	});

	// Cancel order
	$('.cancel_order').click(function () {
		cancelOrder();
	});

	// Order history
	itemsOnPage = 5;
	$('.order_history').click(function () {
		orderHistory();
	});

	$('.return_to_frontpage').click(function () {
		returnToFrontPage(false);
	});
}
)

// Actions
function populateMenu() {
	$.getJSON("data/data.js", function (data) {
		var menuItems = [];
		var imageHtml = "<img src='img/pizza.png' alt='pizza' class='figure' />";
		var buttonHtml = "<span class='button add_to_cart' onclick='addToCart(this);false;'>Add to cart</span>";
		$.each(data.pizzas, function (index, pizza) {
			menuItems.push("<li><div class='pizza'>" 
				+ imageHtml 
				+ "<h4>" + pizza.name + "</h4>" 
				+ "<div class='price'>" + pizza.price + " €</div>"
				+ buttonHtml 
				+ "</div></li>");
		});
		$('#pizza_menu ul').append(menuItems.join(""));
	})
    .fail(function () {
    	alert('Error retrieving pizzas!');
    });
}

function addToCart(selectedItem) { 

    // Get the selected menu item
    var itemToAdd = $(selectedItem).parent('.pizza').parent('li').html();

    // Add the new menu item to the cart
    $('#shopping_cart_items').append('<li>' + itemToAdd + '</li>');
    $('#empty_cart').addClass('hide');

    // Hide the "Add to cart" button of the item on the cart
    $('#shopping_cart .add_to_cart').addClass('hide');

    setShoppingCartHeader();
    setCheckoutAccessibility();
}

function deleteFromCart(selectedItem) {

	// Get the selected cart item
	$(selectedItem).parent('li').remove();
	setCheckoutAccessibility();
}

function deleteAllFromCart() {
	$('#shopping_cart_items li').not('#empty_cart').remove();
	$('#empty_cart').removeClass('hide');
	setCheckoutAccessibility();
}

function clearCart() {
	deleteAllFromCart();
	setShoppingCartHeader();
}

function setShoppingCartHeader() { 
    // Set the count of items in the shopping cart
	var itemCount = getShoppingCartItemCount();
	$('#shopping_cart h3').text('Shopping Cart (' + itemCount + ')');
}

function setCheckoutAccessibility() {
	var itemCount = getShoppingCartItemCount();
	if (itemCount > 0) {
		$('#shopping_cart .button.checkout, #checkout .button.place_order').removeClass('disabled');
		$('input[type="submit"]').disable(false);
	}
	else { 
		$('#shopping_cart .button.checkout, #checkout .button.place_order').addClass('disabled');
		$('input[type="submit"]').disable(true);
	}
}

function getShoppingCartItemCount() { 
    var itemCount = $('#shopping_cart_items li').not('#empty_cart').length; // "Empty cart" item is not counted as a cart item
    return itemCount;
}

function addCartToOrderHistory() { 

	// Get the contents of the current shopping cart
	var currentCart = $('#shopping_cart_items').not('#empty_cart');
	var cartItems = [];
	$.each(currentCart.find('h4'), function (index, cart_item) {
		cartItems.push('<li>' + $(cart_item).text() + '</li>');
	});

	// Add the items to history with a timestamp
	var now = new Date();
	var timestamp = now.getDate() + '.' + (now.getMonth() + 1) + '.' + now.getFullYear() + ' ' + now.getHours() + ':' + now.getMinutes();
	$('#order_history_items').append('<li class="history_entry">' 
		+ '<span>' + timestamp + '</span>'
		+ '<ul class="cart_items">' + cartItems.join("") + '</ul>' 
		+ '</li>');

	// Hide the "empty history" text
	$('#empty_history').addClass('hide');
}

function getOrderHistoryItemsCount() {
	var historyItemsCount = $('#order_history_items li.history_entry').length;
	return historyItemsCount;
}

function showPage(selectedPage) { 
	
	// Get the page number
	var pageNumber;
	if (selectedPage == 1) pageNumber = 1;
	else { 
		var pageNumberClass = $(selectedPage).find('span').attr('class');
		pageNumber = pageNumberClass.replace('page-', '');
	}
	var startAt = ((pageNumber - 1) * itemsOnPage);
	var endAt = (pageNumber * itemsOnPage) - 1;

	var allHistoryItems = $('#order_history_items li.history_entry').addClass('hide');
	$.each(allHistoryItems, function (index, history_item) {
		if (index >= startAt && index <= endAt) {
			$(history_item).removeClass('hide');
		}
	});
}

function setPagination() {
	var historyItemCount = getOrderHistoryItemsCount();
	if (historyItemCount <= itemsOnPage) return;

	var pageCount = getPageCount(itemsOnPage, historyItemCount);
	var paginationPages = [];
	if (pageCount > 1) {
		for (var i = 1; i <= pageCount; i++) {
			var pageClass = "page-" + i;
			paginationPages.push('<li><span class="' + pageClass + '">' + i + '</span></li>');
		}
	}
	$('#order_history_items .pagination').parent('li').remove();
	$('#order_history_items').prepend('<li><ul class="pagination">' + paginationPages.join("") + '</ul></li>');

	$('.pagination li').click(function () {
		showPage(this);
	});
}

function getPageCount(itemsOnPage, itemCount) {
	var pageCount = Math.floor(itemCount / itemsOnPage);
	var rem = itemCount % itemsOnPage;
	if (rem > 0) pageCount++;
	return pageCount;
}

function checkout() {
    CheckoutState(); 
}

function orderHistory() {
	OrderHistoryState();
	setPagination();
	showPage(1);
}

function placeOrder() {
	$('#order_form').validate({
		submitHandler: function (form) {
			addCartToOrderHistory();
			confirmOrder();
		},
		invalidHandler: function (event, validator) {
			$('#order_form .form-control.error').parent().addClass('has-error');
		}
	});
}

function confirmOrder() {
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
	deleteAllFromCart();
    NormalState();
}

function cancelOrder() {
    NormalState();
}

function returnToFrontPage(clearCart) {
	if (clearCart == true) deleteAllFromCart();
    NormalState();
}

// Different states of the page (Normal, OrderForm, OrderConfirmation)
function NormalState() {
    showMenu(true);
    showShoppingCart(true);
    showCheckout(false);
    showOrderConfirmation(false);
    showOrderHistory(false);
    $('#page').addClass('normal_state').removeClass('checkout_state order_confirmation_state order_history_state');
    $('#shopping_cart').addClass('side_content').removeClass('full_content');
    setShoppingCartHeader();
}

function CheckoutState() {
    showMenu(false);
    showShoppingCart(true);
    showCheckout(true);
    showOrderConfirmation(false);
    showOrderHistory(false);
    $('#page').addClass('checkout_state').removeClass('normal_state order_confirmation_state order_history_state');
    // On checkout page, show the shopping cart in full width before the form
    $('#shopping_cart').addClass('full_content').removeClass('side_content');
    $('#shopping_cart h3').text('This is what you are about to order:');
}

function OrderConfirmationState() {
    showMenu(false);
    showShoppingCart(true);
    showCheckout(false);
    showOrderConfirmation(true);
    showOrderHistory(false);
    $('#page').addClass('order_confirmation_state').removeClass('normal_state checkout_state order_history_state');
    // On order confirmation page, show the shopping cart in full width before the form
    $('#shopping_cart').addClass('full_content').removeClass('side_content');
    $('#shopping_cart h3').text('This is what you just ordered:');
}

function OrderHistoryState() { 
    showMenu(false);
    showShoppingCart(false);
    showCheckout(false);
    showOrderConfirmation(false);
    showOrderHistory(true);
    $('#page').addClass('order_history_state').removeClass('normal_state checkout_state order_confirmation_state');
}

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

function showOrderHistory(show) {
	if (show == true) $('#order_history').removeClass('hide');
	else $('#order_history').addClass('hide');
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

// Disable function
jQuery.fn.extend({
    disable: function(state) {
        return this.each(function() {
            this.disabled = state;
        });
    }
});