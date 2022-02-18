$(() => {
  $('#code').on('input', () => { loadfromnbt($('#code').val()); });
  $('#multipage').on('change', () => { loadfromnbt($('#code').val()); });

  //Code For books

  $('.pageactive').each((_, page) => {
    setupPage($(page));
  });
  $('.book_leftarrow').click(function () {
    setupPage($(this).siblings('.pageactive').removeClass('pageactive').prev());
  });
  $('.book_rightarrow').click(function () {
    setupPage($(this).siblings('.pageactive').removeClass('pageactive').next());
  });
});

function setupPage (active) {
  active.addClass('pageactive');
  const index = active.index();
  const length = active.siblings().length - 2;
  active.siblings('.book_pagenum').text('Page ' + index + ' of ' + length);
  active.siblings('.book_leftarrow, .book_rightarrow').show();
  if (index == 1) {
    active.siblings('.book_leftarrow').hide();
  }
  if (index == length) {
    active.siblings('.book_rightarrow').hide();
  }
}

function setPageCount (n) {
  const current = $('.book_pagetext').length;
  if (n > current) {
    for (let i = current; i < n; i++) {
      addpage();
    }
  } else if (n < current) {
    for (let i = current; i > n; i--) {
      removepage();
      if (!$('.book_pagetext.pageactive')) {
        $('.book_pagetext').last().addClass('pageactive');
      }
    }
  }
}

function addpage () {
  $('.book_pagetext.pageactive').after('<div class="book_pagetext"></div>');
  $('.pageactive').each((_, page) => {
    setupPage($(page));
  });
}

function removepage () {
  $('.book_pagetext').last().remove();
  $('.pageactive').each((_, page) => {
    setupPage($(page));
  });
}

document.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    document.execCommand('insertLineBreak');
    event.preventDefault();
  }
});

/* global readNBT */
function loadfromnbt (nbt) {
  try {
    const multipage = $('#multipage').is(':checked');
    const out = readNBT(nbt, multipage);
    if (!multipage) {
      setPageCount(1);
      $('.pageactive').html(out);
    } else {
      setPageCount(out.length);
      $('.book_pagetext').each((i, page) => {
        $(page).html(out[i]);
      });
    }
  } catch (err) {
    // console.log(err);
  }
}
