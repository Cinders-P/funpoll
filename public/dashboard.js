var filled = true;

$(function() {
	$('body, html').css('overflow-y', 'visible');

	// for (var k = 0; k < 6; k++) {
	// 	var pos = (950 - (150 * k)).toString() +  'px';
	// 	$('#s' + k).css('margin-left', pos);
	// }
	//
	// for (var k = 0; k < 6; k++) {
	// 	var pos = (-1060 + (150 * k)).toString() +  'px';
	// 	$('#s' + (6 + k) ).css('margin-left', pos);
	// }

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

	var stop = false;
	var delID =  "";

	$('.delete').click( (e) => {
		stop = true;
		delID = $(e.target).prop('name');
	});

	$('a').click( (e) => {
		if (stop) {
			e.preventDefault();
		}
	});

	$("#del").click( () => {
		$.post('/delete', {delete: delID}, () => {
			stop = false;
			delID = "";
			window.location.reload();
		});
	});

	$('.modal').on('hide.bs.modal', () => {
		stop = false;
		delID = "";
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
