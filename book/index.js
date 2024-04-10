/* exported addpage removepage copycode */

$(() => {
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
  $('.book_pagetext').attr('contenteditable', 'true').on('input', () => {
    generateCode();
  });
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
  generateCode();
}

function generateCode (visual) {
  let code = '';
  if (!visual) code += '{{Book|';
  const start = Number($('#active').val());
  $('.book_pagetext').each((index, page) => {
    let text = $(page).html().replace(/=/gi, '&#61;').replace(/\|/gi, '&#124;');
    if (text.slice(text.length - 4) == '<br>') text = text.slice(0, text.length - 4);
    code += '{{BookPage|' + text;
    if (index + 1 == start) code += '|active=true';
    code += '}}';
  });
  if (!visual) code += '}}';
  $('#code').text(code.replace(/<br>/g, '\n')).val(code.replace(/<br>/g, '\n'));
}

function addpage () {
  $('.book_pagetext.pageactive').after('<div class="book_pagetext"></div>');
  $('.pageactive').each((_, page) => {
    setupPage($(page));
  });
}

function removepage () {
  $('.book_pagetext.pageactive').remove();
  $('.book_pagetext').first().addClass('pageactive');
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

function copycode (visual) {
  generateCode(visual);
  /* Get the text field */
  const copyText = document.getElementById('code');

  /* Select the text field */
  copyText.select();

  /* Copy the text inside the text field */
  document.execCommand('copy');
}
