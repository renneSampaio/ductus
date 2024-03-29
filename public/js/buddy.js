'use strict';

document.addEventListener('DOMContentLoaded', function () {

  /********** OPEN/CLOSE NAVIGATION  WHEN CLICKING ON NAV TRIGGER  **********/
  var body = document.querySelector("body"),
      pageHeaderLeftBar = document.querySelector('.page-header.left-bar'),
      pageHeaderTopBar = document.querySelector('.page-header:not(.left-bar):not(.bottom-bar-mobile)'),
      pageHeaderBottomMobile = document.querySelector('.page-header.bottom-bar-mobile'),
      pageNavOverlay = document.querySelector("#pageNavOverlay"),
      pageNav = document.querySelectorAll(".page-nav"),
      triggerNavContainer = document.querySelectorAll('[data-trigger-nav]'),
      triggerSubNavPrimary = document.querySelectorAll('.has-sub-level'),
      navPrimaryLI = document.querySelectorAll('.nav-primary > li');
  //toggle the left navbar
  var toggleNav = function toggleNav(event) {
    event.preventDefault();

    var dataTriggerNav = event.currentTarget.dataset.triggerNav;
    var i = 0;

    while (i < pageNav.length) {
      if (pageNav[i].id == dataTriggerNav) body.classList.contains('menu-opened') ? body.classList.remove('menu-opened') : body.classList.add('menu-opened');
      i++;
    }
  };
  var i = 0;
  while (i < triggerNavContainer.length) {
    triggerNavContainer[i].addEventListener('click', toggleNav);
    i++;
  }

  //close the left navbar
  var closeNav = function closeNav() {
    body.classList.remove('menu-opened');
  };
  pageNavOverlay.addEventListener('click', closeNav);

  //toggle the subnav
  var toggleSubNav = function toggleSubNav(event) {
    if (pageHeaderTopBar || pageHeaderLeftBar) {
      if (!pageHeaderBottomMobile) event.preventDefault();
    }

    if (pageHeaderBottomMobile && window.innerWidth > 1024) event.preventDefault();

    if (window.innerWidth < 1025 || pageHeaderLeftBar) event.currentTarget.classList.toggle('show');
  };
  var j = 0;
  while (j < triggerSubNavPrimary.length) {
    triggerSubNavPrimary[j].addEventListener('click', toggleSubNav);
    j++;
  }

  //on resize, if window width > 1024px then close the nav and if < 1024px then allow click on  <li> which have .has-sub-level class to display sub nav
  window.addEventListener('resize', function () {
    if (this.innerWidth > 1024) closeNav();

    if (this.innerWidth < 1024) {
      var _j = 0;
      while (_j < triggerSubNavPrimary.length) {
        triggerSubNavPrimary[_j].addEventListener('click', toggleSubNav);
        _j++;
      }
    }
  });

  //accessibility enter key
  for (var _i = 0, x = navPrimaryLI.length; _i < x; _i++) {
    navPrimaryLI[_i].addEventListener('keyup', function (event) {
      for (var _j2 = 0, _x = navPrimaryLI.length; _j2 < _x; _j2++) {
        navPrimaryLI[_j2].classList.remove('show');
      }
      event.currentTarget.classList.add('show');
    });
  }

  //accessibility
  if (!pageHeaderLeftBar) {
    document.addEventListener("click", function (event) {
      // If user clicks inside the navigation, do nothing, else remove active class
      if (event.target.closest(".has-sub-level")) return;else {
        for (var _j3 = 0, _x2 = navPrimaryLI.length; _j3 < _x2; _j3++) {
          navPrimaryLI[_j3].classList.remove('show');
        }
      }
    });
  }
  /********** OPEN/CLOSE NAVIGATION WHEN CLICKING ON NAV TRIGGER **********/
}, false);
'use strict';

document.addEventListener('DOMContentLoaded', function () {

  /********** component modal **********/
  if (document.getElementById('pageModals')) {
    var pageModals = document.getElementById('pageModals'),
        boxModal = pageModals.getElementsByClassName('box-modal'),
        triggerOpenModal = document.getElementsByClassName('triggerOpenModal'),
        triggerCloseModal = document.getElementsByClassName('triggerCloseModal'),
        body = document.getElementsByTagName('body')[0],
        pageModalsOverlayer = document.getElementById('pageModalsOverlayer');

    var openModal = function openModal(event) {
      var dataModal = event.currentTarget.getAttribute('data-modal');
      pageModals.classList.add('show');
      pageModals.removeAttribute('aria-hidden');
      body.classList.add('modal-open');

      for (var i = 0, x = boxModal.length; i < x; i++) {
        if (boxModal[i].getAttribute('data-modal') == dataModal) {
          boxModal[i].classList.add('show');
        }
      }
    };

    var closeModal = function closeModal() {
      pageModals.classList.remove('show');
      body.classList.remove('modal-open');
      pageModals.setAttribute('aria-hidden', true);
      for (var i = 0, x = boxModal.length; i < x; i++) {
        boxModal[i].classList.remove('show');
      }
    };

    for (var i = 0, x = triggerOpenModal.length; i < x; i++) {
      triggerOpenModal[i].addEventListener('click', openModal);
    }

    for (var _i = 0, _x = triggerCloseModal.length; _i < _x; _i++) {
      triggerCloseModal[_i].addEventListener('click', closeModal);
    }

    document.onkeydown = function (event) {
      if (pageModals.classList.contains('show')) {
        event = event || window.event;
        if (event.keyCode == 27) closeModal();
      }
    };

    pageModalsOverlayer.addEventListener('click', closeModal);
  }
  /********** component modal **********/

  /********** component form / input animation **********/
  var inputs = document.querySelectorAll('.input-animation input, .input-animation textarea'),
      textarea = document.querySelectorAll('.input-animation textarea');

  var focusInAnimation = function focusInAnimation(event) {
    event.currentTarget.parentNode.classList.add('active');
  };

  var focusOutAnimation = function focusOutAnimation(event) {
    if (event.currentTarget.value == "") event.currentTarget.parentNode.classList.remove('active');
  };

  var resize = function resize(event) {
    event.currentTarget.style.height = "1px";
    event.currentTarget.style.height = event.currentTarget.scrollHeight + "px";
  };

  for (var _i2 = 0, _x2 = inputs.length; _i2 < _x2; _i2++) {
    inputs[_i2].addEventListener('focusin', focusInAnimation);
    inputs[_i2].addEventListener('change', focusInAnimation);
    inputs[_i2].addEventListener('keyup', focusInAnimation);
    inputs[_i2].addEventListener('blur', focusInAnimation);
    inputs[_i2].addEventListener('input', focusInAnimation);
    inputs[_i2].addEventListener('focusout', focusOutAnimation);
  }

  for (var _i3 = 0, _x3 = textarea.length; _i3 < _x3; _i3++) {
    textarea[_i3].addEventListener('keyup', resize);
  }

  /********** component form / input animation **********/

  /********** component collapse **********/
  var boxCollapseTrigger = document.querySelectorAll('.box-collapse .box-collapse-trigger button'),
      boxCollapseContent = document.querySelectorAll('.box-collapse .box-collapse-content');

  var toggleBoxCollapse = function toggleBoxCollapse(event) {
    var dataCollapse = event.currentTarget.getAttribute('data-collapse');

    for (var _i4 = 0, _x4 = boxCollapseContent.length; _i4 < _x4; _i4++) {
      if (boxCollapseContent[_i4].getAttribute('id') == dataCollapse) {

        if (boxCollapseContent[_i4].classList.contains('is-expanded')) {
          event.currentTarget.setAttribute('aria-expanded', false);
          boxCollapseContent[_i4].classList.remove('is-expanded');
        } else {
          event.currentTarget.setAttribute('aria-expanded', true);
          boxCollapseContent[_i4].classList.add('is-expanded');
        }
      }
    }
  };

  for (var _i5 = 0, _x5 = boxCollapseTrigger.length; _i5 < _x5; _i5++) {
    boxCollapseTrigger[_i5].addEventListener('click', toggleBoxCollapse);
  }
  /********** component collapse **********/

  /********** component tabs **********/
  if (document.getElementById('tabsWrapper')) {
    var tabsTriggers = document.querySelectorAll('.tabs-wrapper [role="tab"]'),
        tabsPanels = document.querySelectorAll('.tabs-wrapper [role="tabpanel"]'),
        tabsWrapper = document.getElementById('tabsWrapper');

    if (window.innerWidth > 640) {
      // set height to tabsWrapper depending of panel height + 100px
      tabsWrapper.style.height = document.querySelector('[aria-selected="true"]').nextElementSibling.clientHeight + 100 + 'px';
    }

    window.addEventListener('resize', function () {
      if (this.innerWidth > 640) tabsWrapper.style.height = document.querySelector('[aria-selected="true"]').nextElementSibling.clientHeight + 100 + 'px';else tabsWrapper.style.height = 'auto';
    });

    var toggleTabsContent = function toggleTabsContent(event) {
      var ariaControls = event.currentTarget.getAttribute('aria-controls');

      for (var _i6 = 0, _x6 = tabsPanels.length; _i6 < _x6; _i6++) {
        tabsPanels[_i6].setAttribute('hidden', 'true');
        tabsTriggers[_i6].setAttribute('aria-selected', 'false');
      }

      event.currentTarget.setAttribute('aria-selected', 'true');

      document.getElementById(ariaControls).removeAttribute('hidden');

      if (window.innerWidth > 640) {
        // set height to tabsWrapper depending of panel height + 100px
        tabsWrapper.style.height = document.getElementById(ariaControls).clientHeight + 100 + 'px';
      }

      window.addEventListener('resize', function () {
        if (this.innerWidth > 640) tabsWrapper.style.height = document.getElementById(ariaControls).clientHeight + 100 + 'px';else tabsWrapper.style.height = 'auto';
      });
    };

    for (var _i7 = 0, _x7 = tabsTriggers.length; _i7 < _x7; _i7++) {
      tabsTriggers[_i7].addEventListener('click', toggleTabsContent);
    }
  }
  /********** component tabs **********/
}, false);
//# sourceMappingURL=buddy.js.map
