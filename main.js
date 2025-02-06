AOS.init({ once: true });

$('.close-nav-bar').on('click', function () {
  $('.mobile-side-bar').removeClass('left-0');
  $('.over-lay').addClass('hidden')
})
$('.open-side-bar').on('click', function () {
  $('.mobile-side-bar').addClass('left-0')
  $('.over-lay').removeClass('hidden')
})
$('.over-lay').on('click', function () {
  $('.mobile-side-bar').removeClass('left-0');
  $('.over-lay').addClass('hidden')
})



const swiper = new Swiper('.swiper', {
    // Optional parameters
    loop: true,
    autoplay: true,
    breakpoints: {
        // when window width is >= 320px
        320: {
            slidesPerView: 1,
            spaceBetween: 30
        },
        // when window width is >= 480px
        1024: {
            slidesPerView: 3,
            spaceBetween: 40
        },
    },
  
    // If we need pagination
    pagination: {
      el: '.swiper-pagination',
    },
  
    // Navigation arrows
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });

  const swiper_two = new Swiper('.swiper.swiper-two', {
    // Optional parameters
    loop: true,
    autoplay: {
      delay: 1500,
      disableOnInteraction: true
    },
  
    // If we need pagination
    pagination: {
      el: '.swiper-pagination',
    },
  
    // Navigation arrows
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });