(function($) {
    var windowWidth = $(window).width();

    if (windowWidth > 767) {
      /*calc scrollBar size*/
        jQuery.getScrollBarSize = function() {
           var inner = $('<p></p>').css({
              'width':'100%',
              'height':'100%'
           });
           var outer = $('<div></div>').css({
              'position':'absolute',
              'width':'100px',
              'height':'100px',
              'top':'0',
              'left':'0',
              'visibility':'hidden',
              'overflow':'hidden'
           }).append(inner);

           $(document.body).append(outer);

           var w1 = inner.width();
           outer.css('overflow','scroll');
           var w2 = inner.width();
           if (w1 == w2 && outer[0].clientWidth) {
              w2 = outer[0].clientWidth;
           }

           outer.detach();

           return [(w1 - w2)];
        };

        var scrollBar = $.getScrollBarSize(); 
        scrollBar = scrollBar + 'px';

      /*modal*/
        $('.open-modal').on('click', function(){
            syncActives($('.gallery-modal'), $('.gallery-page'));
            $('body').css('padding-right',scrollBar);
            $('html').addClass('bg-active modal');
        });
        $('.dark-bg.modal, .close-modal').on('click', function(event){
            var target = $( event.target );
            if ( target.is( ".dark-bg.modal, .close-modal" ) ) {
                $('html').removeClass('bg-active modal');
                $('body').css('padding-right','0');
                syncActives($('.gallery-page'), $('.gallery-modal'));
            }               
        });

      $('.slider-wrapper').clone().appendTo('.gallery-modal');
      var arrowNextModal = $('.gallery-modal .arrow.next');
      var tbumbsModal = $('.gallery-modal .thumbs');
      var thumbWrapperModal = $('.gallery-modal .thumb-wrapper');
      var marginTbumb = 2*2;
    }
    else{
      var marginTbumb = 12*2;
    }    
   
    var arrowsWidth = 20*2;
    var arrowPrev = $('.arrow.prev');
    var arrowNext = $('.arrow.next');
    var arrowNextPage = $('.gallery-page .arrow.next');    

    var tbumbsPage = $('.gallery-page .thumbs');   
    var thumbWrapperPage = $('.gallery-page .thumb-wrapper');
    var tbumbItem = $('.thumb-item');
    var tbumbItemCalc = $('.gallery-page .thumb-item');
    var tbumbSize = tbumbItemCalc.outerWidth()+marginTbumb;   
    var thumbsWidth = tbumbItemCalc.size()*tbumbSize;


    //calc thumbs width, show/hide next arrow
    function calcThumbsPropery(tbumbs, thumbWrapper, next){
      var thumbsWrapperWidth = tbumbs.width();

      if ( (thumbsWidth > thumbsWrapperWidth) || (windowWidth < 768) ) {
        next.parent().addClass('visible-arrows');
        next.show();
      };

      if (thumbsWidth > thumbsWrapperWidth) {             
        //calc how many full thumb item is visible in thumbs wrapper
        var thumbVisible = Math.floor(thumbsWrapperWidth/tbumbSize)
        var newThumbsWrapperWidth = tbumbSize * thumbVisible;
        var fullThumbsWidth = newThumbsWrapperWidth + arrowsWidth;
        tbumbs.css('width',fullThumbsWidth);
        thumbWrapper.css('width',newThumbsWrapperWidth);

        for (var i = 1; i <= thumbVisible; i++) {
          thumbWrapper.find('.thumb-item[data-item="'+i+'"]').addClass('visible');
        };
        
      }
      else{
        //set thumb-wrapper width, centered
        thumbWrapper.css('width',thumbsWidth);
        thumbWrapper.find('.thumb-item').addClass('visible');
      }
    }

    //show/hide arrows
    function toggleArrow(e, classButton, button){
      if (e.hasClass(classButton)) {
        button.hide();
      }
      else{
        button.show();
      }
    }
    
    //set full image
    function setFullImage(gallery, noActive, active, imageSource){
      noActive.removeClass('active');
      active.addClass('active');
      gallery.find('.full-image img').attr('src',imageSource);
    }

    /*sync active item on page & in modal*/
    function syncActives(syncGallery, activeGallery){
      var activeItem = syncGallery.find('.thumb-item.active');
      var imageSource = activeGallery.find('.full-image img').attr('src');
      var syncActiveThumb = syncGallery.find('.thumb-item img[src="'+imageSource+'"]').parent().parent();     
      setFullImage(syncGallery, activeItem, syncActiveThumb, imageSource);

      var visibleActive = syncGallery.find('.thumb-item.active');
      //sync arrows
      var visibleArrows = syncGallery.find('.thumbs.visible-arrows');        
      if ( visibleArrows ) {
        toggleArrow(visibleActive, 'last', visibleArrows.find('.arrow.next'));
        toggleArrow(visibleActive, 'first', visibleArrows.find('.arrow.prev'));
      }

      // scroll tbumbs if active thumb isn`t visible
      
      if ( visibleActive.hasClass('visible') == false ) {
        //current visible items
        var visibleArray = [];
        visibleArray = syncGallery.find('.thumb-item.visible')
        var visibleArrayLength = visibleArray.length;
        //var firstVisible = syncGallery.find('.thumb-item.visible').first().attr('data-item');
        var lastVisible = syncGallery.find('.thumb-item.visible').last().attr('data-item');

        // calc + set new visible items from thumb index
        var indexLast = syncGallery.find('.thumb-item.last').attr('data-item');
        var indexActive = visibleActive.attr('data-item');
        var activePosition = indexLast-indexActive;

        visibleArray.removeClass('visible');
        visibleActive.addClass('visible');
        //set active element to max right visible position
        if ( (activePosition==0) || (activePosition <= visibleArrayLength) ) {
          for (var i=0; i<visibleArrayLength-1; i++) {
            syncGallery.find('.thumb-item.visible').first().prev().addClass('visible');
          }           
        }
        //set active element to max left visible position
        else{
          for (var i=0; i<visibleArrayLength-1; i++) {
            syncGallery.find('.thumb-item.visible').last().next().addClass('visible');
          }      
        }

        //scroll all thumbs to visible items
        if ( visibleArrows ) {
          var thumbInnerWrapper = visibleArrows.find('.thumb-inner-wrapper');
          var scrollValue = syncGallery.find('.thumb-item.visible').first().attr('data-item'); 
          thumbInnerWrapper.css('left','0');
          scrollValue = tbumbSize*scrollValue-tbumbSize;
          console.log('scr', scrollValue);
          thumbInnerWrapper.animate({
            left: '-='+scrollValue+'px'
          });          
        } 
      };
    }

    //set thumbs width, show/hide next arrow on page & in modal
    calcThumbsPropery(tbumbsPage, thumbWrapperPage, arrowNextPage);
    if (windowWidth > 767) {
      calcThumbsPropery(tbumbsModal, thumbWrapperModal, arrowNextModal);
    }

    //change full-image
    tbumbItem.on('click', function(){
      var e = $(this);
      var activeGallery = e.parent().parent().parent().parent().parent();
      var activeItem = activeGallery.find('.thumb-item.active');
      var imageSource = e.find('img').attr('src');

      setFullImage(activeGallery, activeItem, e, imageSource);
      var visibleArrows = activeGallery.find('.thumbs.visible-arrows');
      if ( visibleArrows ) {
        toggleArrow(e, 'first', visibleArrows.find('.arrow.prev'));
        toggleArrow(e, 'last', visibleArrows.find('.arrow.next'));
      }
    });

    //slide to next item from arrow
    arrowNext.on('click',function(){ 
      var activeGallery = $(this).parent().parent().parent();
      var activeItem = activeGallery.find('.thumb-item.active');
      var nextItem = activeItem.next();
      var imageSource = nextItem.find('img').attr('src');

      setFullImage(activeGallery, activeItem, nextItem, imageSource);

      var visibleArrows = activeGallery.find('.thumbs.visible-arrows');
      var thumbInnerWrapper = visibleArrows.find('.thumb-inner-wrapper');

      if (nextItem.hasClass('visible') == false) {
        activeGallery.find('.thumb-item.visible').first().removeClass('visible');

        nextItem.addClass('visible');
        thumbInnerWrapper.animate({
          left: '-='+tbumbSize+'px'
        });
      };
      
      toggleArrow(nextItem, 'first', visibleArrows.find('.arrow.prev'));
      toggleArrow(nextItem, 'last', visibleArrows.find('.arrow.next'));
    });

    //slide to previous item from arrow
    arrowPrev.on('click',function(){
      var activeGallery = $(this).parent().parent().parent();
      var activeItem = activeGallery.find('.thumb-item.active');
      var prevItem = activeItem.prev();
      var imageSource = prevItem.find('img').attr('src');

      setFullImage(activeGallery, activeItem, prevItem, imageSource);

      var visibleArrows = activeGallery.find('.thumbs.visible-arrows');
      var thumbInnerWrapper = visibleArrows.find('.thumb-inner-wrapper');

      if (prevItem.hasClass('visible') == false) {
        activeGallery.find('.thumb-item.visible').last().removeClass('visible');
        
        prevItem.addClass('visible');
        thumbInnerWrapper.animate({
          left: '+='+tbumbSize+'px'
        });
      };

      toggleArrow(prevItem, 'first', visibleArrows.find('.arrow.prev'));
      toggleArrow(prevItem, 'last', visibleArrows.find('.arrow.next'));
    });


})(jQuery);