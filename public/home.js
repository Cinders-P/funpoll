var filled = true;

$(function() {
	//intro animation
    $('.fade-in.card').css({
        'margin-top': '20px'
    });
	$('.fade-in:last-of-type').css({
		'margin-top': '-20px'
	});
    $('.fade-in.card').animate({
        'opacity': 1,
        'margin-top': 0
    }, 1000, () => {
        $('.fade-in:last-of-type').animate({
            'opacity': 1,
            'margin-top': 0
        }, 1000, () => {
            $('body, html').css('overflow-y', 'visible');
			$('.jumbotron').animate({
		        'opacity': 1,
		        'margin-top': 0
		    }, 1000, () => {});
        });
    });

	//form auto answers
	var nextChoice = 3;
	$(document).keyup(() => {
		if (nextChoice === 20)
			return;

		filled = true;
		for (var i = 0; i < nextChoice; i++) {
			if (!/\S/g.test($('input[name='+i+']').val()))
				filled = false;
		}
		if (filled) {
			addChoice(nextChoice++);
		}
	});
});


function addChoice(x) {
	$('#choices').append('<div class="form-group"><div class="input-group-addon">' + (x+1) + '</div><input class="form-control form-control-lg" type="text" name="'+ x + '"></input></div>');
}

function stripEmpty() {
	for (var i = 0; i < 20; i++) {
		if (!/\S/g.test($('input[name='+i+']').val())) {
			$('input[name='+i+']').attr('name', null);
		}
	}
	console.log('sending post');
}
