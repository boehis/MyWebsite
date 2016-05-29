"use strict";

$(document).ready(function () {

    $.each($('.include-content'), function (i, e) {
        var div = $(e);
        var page = div.attr('data-content');
        div.load('includes/' + page);
        div.addClass((i % 2 === 0) ? 'content-one' : 'content-two');
    });

    var toggleItem = $('.toggle-item');

    $(window).scroll(onScroll);
    $('.scroll-item').click(onScrollItemClicked);
    toggleItem.click(onToggleTheme);

    //Setup content
    if (localStorage.getItem("theme") == 0) {
        toggleItem.trigger("click");
    }
});

var activeNav;
var autoScrolling = false;

function onScroll() {
    var scrollTop = $(window).scrollTop();
    updateNavigation(scrollTop);
    playBallGame(scrollTop);
}
function updateNavigation(scrollTop) {
    var stickyHeaderTop = $('.content').offset().top - $('.navigation-box').height();
    var itemOffset = ($(window).height() / 4 > 200) ? $(window).height() / 4 : 200;

    if (scrollTop >= stickyHeaderTop) {
        $('.navigation-box').addClass("navigation-scrolling");
    }
    else {
        $('.navigation-box').removeClass("navigation-scrolling");
    }

    if (!autoScrolling) {
        var result = $.grep($('.scroll-item'), function (e) {
            if (e.id === 'scrollup-link') {
                return false;
            }
            var contentId = $(e).attr('data-content');
            return scrollTop + itemOffset >= $('#' + contentId).offset().top;
        });
        if (result.length == 0) {
            $(activeNav).removeClass("active-scroll-item");
            return;
        }
        var currentNav = $(result[result.length - 1]);
        if (currentNav !== activeNav) {
            $(activeNav).removeClass("active-scroll-item");
            currentNav.addClass('active-scroll-item');
            activeNav = currentNav;
        }
    }
}

function onScrollItemClicked() {
    var navitem = $(this);
    var scrollTarget = $("#" + navitem.data("content")).offset().top;
    autoScrolling = true;
    $(activeNav).removeClass("active-scroll-item");
    $(this).addClass("active-scroll-item");
    if (navitem.data('content') == 'home') {
        scrollTarget -= 200;
    }
    activeNav = this;
    $('body').animate({
        scrollTop: scrollTarget
    }, {
        duration: 2000,
        easing: 'easeInOutCubic'
    }, function () {
        autoScrolling = false;
        if ($(window).scrollTop() === 0) {
            $(activeNav).removeClass("active-scroll-item");
        }
    });
}
function onToggleTheme() {
    var stylesheet = $('#style-dark-theme');
    if (stylesheet.attr('disabled') === 'disabled') {
        stylesheet.removeAttr('disabled');
        localStorage.setItem("theme", 0);
    } else {
        stylesheet.attr('disabled', 'disabled');
        localStorage.setItem("theme", 1);
    }
    $('window').trigger('mousemove');
}



