$(function() {

	// Custom JS
	// Firebase setup
	var file;
	var folder = '';
	var mainScreen = document.getElementById('main-screen');
	var filesScreen = document.getElementById('filesScreen');
	var mainForm = document.getElementsByTagName('form')[0];
	var fileList = document.getElementsByClassName('file-list')[0];
	var inputDownload = document.querySelector('.key-input');
	var errorWindow = document.querySelector('.main-window');
	var modalMSG = document.querySelector('.modal-message');
	

	var fileButton = document.getElementById('file');
	fileButton.addEventListener('change', function(e){
		var filepath = $('#file').val();
		file = e.target.files[0];
		var separator = filepath[2];
		var filename = filepath.split(separator);
		$('#label').append( '<p>' + filename[filename.length - 1] + '</p>' ).css('font-size', '14px');
		$('#label i').css('display', 'none');
	});

	var config = {
	    apiKey: "AIzaSyCCQ1baclGhVTSAWZ-ZNzgYDGBWKRtFfkU",
	    authDomain: "coimbra-own-cloud.firebaseapp.com",
	    databaseURL: "https://coimbra-own-cloud.firebaseio.com",
	    projectId: "coimbra-own-cloud",
	    storageBucket: "coimbra-own-cloud.appspot.com",
	    messagingSenderId: "571851800778"
	};
	firebase.initializeApp(config);
	var storageRef = firebase.storage().ref();
	//===============================
	var body = document.body, html = document.documentElement;

	var height = Math.max( body.scrollHeight, body.offsetHeight, 
    html.clientHeight, html.scrollHeight, html.offsetHeight );
	html.style.height = (height) + 'px';

	function showErrorMSG(text, err) {
		modalMSG.style.display = 'block';
		errorWindow.style.animation = 'errorIn 1s';
		errorWindow.getElementsByTagName('p')[0].innerHTML = text;
		errorWindow.getElementsByTagName('p')[1].innerHTML = err;

	};
	

	$('button').click(function() {
		var item = $(this);
		item.css('animation', 'btnClick .4s');

		setTimeout(function() {
			item.removeAttr('style');
		} ,450);
	});
	document.querySelector('.modal-message .main-window .msg-content .cancel').addEventListener('click', function(){
		errorWindow.style.animation = 'errorOut 1s';
		setTimeout(function() {
			modalMSG.style.display = 'none';
		}, 1000);
	});
	document.getElementById('key-form').addEventListener('focusout', function() {
		console.log('focus out');
		setTimeout(function() {
			document.querySelector('.key').style.display = 'inline-block';
			document.querySelector('.input-controls').style.display = 'none';			
		}, 200);

	});
	document.addEventListener('click', function(e){
		if( e.target ) {
			if( e.target.classList.contains('fa-trash-alt') ) {
				elem = e.target.parentElement.parentElement.getAttribute('name');
				console.log('name: ' + elem);

				
				var fileRemove = e.target.parentElement.parentElement.childNodes[0].nodeValue;
				console.log('file to remove: ',  fileRemove);
				storageRef = firebase.storage().ref(folder + '/' + fileRemove).delete().then(function() {
					firebase.database().ref('files/' + folder).child(elem).remove().catch(function(error){
						console.log('some error in removing child in database');
						showErrorMSG('deleting from list', error);
					});
					firebase.database().ref('files/' + folder).once('value').then(function(snapshot){
						console.log('***Delete***', snapshot.val());
						var obj = {};
						var i = 1;
						for( var key in snapshot.val() ) {
							if( key == 'CreateDate') {
								obj['CreateDate'] = snapshot.val()[key];
							} else {
								obj[i] = snapshot.val()[key];
								i++;	
							}
							
						};
						firebase.database().ref('files/' + folder).set(obj);
						e.target.parentElement.parentElement.remove();
					}).catch(function(error){
						console.log('some error in restructuring list after deleting');
						showErrorMSG('restructuring after deleting', error);
					});
				})
				.catch(function(error){
					console.log('File not removed!!!', error);
					showErrorMSG('file not removed', error);
				});
			};
			if( e.target.classList.contains('fa-cloud-download-alt') ) {
				elem = e.target.parentElement.parentElement.getAttribute('name');
				console.log('name: ' + elem);
				var fileDownload = e.target.parentElement.parentElement.textContent;
				console.log('file to load: ', fileDownload);			
			};
			if( e.target.classList.contains('cancel') ) {
				e.target.parentElement.classList.toggle('visible');
			}
			if( e.target.classList.contains('line-1') || e.target.classList.contains('line-2') ) {
				e.target.parentElement.parentElement.classList.toggle('visible');
			}
			if( e.target.parentElement.id == 'upload-file') {
				folder = generateKey(7);
				console.log( 'storage key: ', folder );
				firebase.database().ref('files').child(folder).once('value').then(function(snapshot){
					if( snapshot.val() ) {
						console.log('keystorage exist!');
						$('.file-list ul').empty();
						snapshot.forEach(function(childSnapshot) {
							var key = childSnapshot.key;
							console.log('upload data key: ', key);
							if(key != 'CreateDate') {
								var childData = childSnapshot.val();
								 var el = 
								'<li name=\"'+ key +'\"">' + 
									childData + 
								'<div class=\"icon-wrap text-right\">' + 
										'<i class=\"fas fa-trash-alt\"><span class=\"tooltip\">Видалити файл</span></i>' +
								'</div></li>';
								$('.file-list ul').append( el );
								height = Math.max( body.scrollHeight, body.offsetHeight, 
					    		html.clientHeight, html.scrollHeight, html.offsetHeight );
								html.style.height = (height) + 'px';
							}
						});
					}
				}).catch(function(error){
						console.log('some error in upload file');
						showErrorMSG('uploading file', error);
					});

				mainScreen.style.animation = 'fadeOut 1s';
				setTimeout(function() {
					mainScreen.style.display = 'none';
					height = Math.max( body.scrollHeight, body.offsetHeight, 
		    		html.clientHeight, html.scrollHeight, html.offsetHeight );
					html.style.height = (height) + 'px';
				}, 1000);
				console.log('upload file!');

				// list element

				filesScreen.style.display = 'block';
				
				mainForm.style.animation = 'showLeft 1s';
				mainForm.style.display = 'block';

				setTimeout(function(){
					fileList.style.animation = 'listAnim 1s';
					fileList.style.display = 'block';
				}, 1000);

				document.querySelector('.key').innerHTML = folder;
			};
			if( e.target.parentElement.id == 'download-file') {
				mainScreen.style.animation = 'fadeOut 1s';
				setTimeout(function() {
					mainScreen.style.display = 'none';	
					console.log(inputDownload);
					inputDownload.style.animation = 'showLeft 1s';
					inputDownload.style.display = 'block';
				}, 800);
			};
			if( e.target.classList.contains('modal-message') ) {
				errorWindow.style.animation = 'errorOut 1s';
				setTimeout(function() {
					e.target.style.display = 'none';
				}, 1000);
			};

			switch(e.target.id) {
				case 'key-button':
					console.log('switch: key-button');
					document.querySelector('p.wrong-key').innerHTML = '';
					var fileKey = document.getElementById('file-key').value;

					if (!fileKey) {
						document.querySelector('p.wrong-key').innerHTML = 'Введіть ключ!';
					} else {
						console.log('key-button: ', fileKey);
						firebase.database().ref('files/' + fileKey).once('value', function(snapshot) {
							if ( snapshot.val() ) {
								document.getElementById('file-key').value = '';
								console.log('Folder exist');
								var keyInput = document.querySelector('.key-input');
								document.querySelector('.file-list .key').innerHTML = fileKey;

								keyInput.style.animation = 'showUp 1s';
								
								setTimeout( function() {
									mainForm.style.display = 'none';
									keyInput.style.display = 'none';
									filesScreen.style.animation = '';
									document.getElementById('meeseeks').style.display = 'block';
									filesScreen.style.display = 'block';
									fileList.style.animation = 'listAnim 1s';
									fileList.style.display = 'block';	
								}, 1000);


								$('.file-list ul').empty();
								storageRef = firebase.storage().ref();
								snapshot.forEach(function(childSnapshot){
									var key = childSnapshot.key;
									var childData = childSnapshot.val();
									console.log('Download files key: '+ key + '  ');

									if(key != 'CreateDate') {
										storageRef.child(fileKey + '/' + childData).getDownloadURL().then(function(url) {
										  // `url` is the download URL for 'images/stars.jpg'
										 var el = 
										'<li name=\"'+ key +'\"">' + 
											childData + 
										'<div class=\"icon-wrap text-right\">' + 
												'<a href=\"'+ url +'\" target=\"_blank\" download><i class=\"fa fa-cloud-download-alt\"><span class=\"tooltip\">Завантажити</span></i></a>' + 
										'</div></li>';

											$('.file-list ul').append( el );
											height = Math.max( body.scrollHeight, body.offsetHeight, 
								    		html.clientHeight, html.scrollHeight, html.offsetHeight );
											html.style.height = (height) + 'px';

										}).catch(function(error) {
										  // Handle any errors
										  console.log('download error: ', error);
										  showErrorMSG('download', error);
										});
									} 
								});
							} else {
								console.log('folder is not exist');
								document.querySelector('p.wrong-key')
								.innerHTML = 'ключ введено невірно або <br> файлів за цим ключем не завантажено';
							};
						}).catch(function(error){
							console.log('some error in key-button');
							showErrorMSG('key button', error);
						});
					};
				break;
				case 'how2use':
					console.log('switch: how2use');
					if (document.querySelector('.rules').classList.contains('visible') ) {
						document.querySelector('.rules').classList.remove('visible');
					}
					var elem = document.querySelector('.howuse');
					console.log('elem: ', elem);
					elem.classList.toggle('visible');
				break;
				case 'rules':
					console.log('read this rules!!!');
					if( document.querySelector('.howuse').classList.contains('visible') ) {
						document.querySelector('.howuse').classList.remove('visible');
					}
					var elem = document.querySelector('.rules');
					console.log('elem: ', elem);
					elem.classList.toggle('visible'); 
				break;
				case 'input-key':
				console.log('switch: input key');
					document.querySelector('.key').style.display = 'none';
					document.querySelector('.input-controls').style.display = 'inline-block';
					document.getElementById('key-form').focus();
				break;
				case 'key-form-submit':
					var inputKey = document.getElementById('key-form').value;
					console.log('input value: ', inputKey);
					firebase.database().ref('files/'+ inputKey).once('value').then(function(snapshot){
						if( snapshot.val() && inputKey ) {
							console.log('key exist');
							folder = inputKey;
							$('.file-list ul').empty();
							document.querySelector('.key').innerHTML = inputKey;
							snapshot.forEach(function(childSnapshot){
								var key = childSnapshot.key;
								console.log('upload data key: ', key);
								if(key != 'CreateDate') {
									var childData = childSnapshot.val();
									 var el = 
									'<li name=\"'+ key +'\"">' + 
										childData + 
									'<div class=\"icon-wrap text-right\">' + 
											'<i class=\"fas fa-trash-alt\"><span class=\"tooltip\">Видалити файл</span></i>' +
									'</div></li>';
									$('.file-list ul').append( el );
									height = Math.max( body.scrollHeight, body.offsetHeight, 
						    		html.clientHeight, html.scrollHeight, html.offsetHeight );
									html.style.height = (height) + 'px';
								}
							});
						} else {
							console.log('key doesn\'t exist');
							showErrorMSG('Введіть дійсний ключ!', 'файли за даним ключем відсутні');
							document.getElementById('key-form').value = '';
						}
					}).catch(function(error){
						console.log('some error in key form submit');
						showErrorMSG('key form submit', error);
					});
					document.querySelector('.key').style.display = 'inline-block';
					document.querySelector('.input-controls').style.display = 'none';
				break;
				case 'logo':
					console.log('logo click');
					console.log('my key: ', generateKey(7));
					filesScreen.style.animation = 'fadeOut 1s';
					setTimeout(function(){
						filesScreen.style.display = 'none';
						document.getElementById('meeseeks').style.display = 'none';
						mainScreen.style.display = 'block';
						mainScreen.style.animation = 'fadeIn 1s';
						inputDownload.style.display = 'none';
					}, 1000);
					fileKey = '';
					folder = '';
					fileList.getElementsByTagName('ul')[0].innerHTML = '<li class=\"template\">завантажте файли</li>';
				break;
				default: 
				break;
			};
		};
	});

	$('#send').click(function() {
		var number;
		if(file) {
			firebase.database().ref('files/' + folder).once('value').then(function(snapshot) {
				//console.log( snapshot.val() );
				number = Object.size(snapshot.val()) + 1;

				if( number > 7 ) {
					console.log('count of files is to large');
					showErrorMSG('Ліміт файлів в сховищі перевищено!', 'storage overflow');
					return;
				}
				for( var key in snapshot.val() ) {
					if( snapshot.val()[key] === file.name ) {
						console.log('this file is already exist!');
						showErrorMSG('Даний файл вже завантажено', 'file already exist');
						return;
					}
				}
				storageRef = firebase.storage().ref(folder + '/' + file.name);
				var task = storageRef.put(file);
				task.on('state_changed', onProgress, onError, function() { onSuccess(file.name, folder); } );
				console.log('file: ', file);
				console.log('storage Ref: ', storageRef);
			}).catch(function(error){
						console.log('some error in #send');
						showErrorMSG('#send file', error);
			});
		} else {
			showErrorMSG('Спочатку виберіть файл з діалогового вікна, або перетяніть його на файлову форму', '');
		}
	});
});


// Help function
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};



function log(html) {
 // document.getElementById('log').innerHTML = html;
  console.log(html);
};

function onSuccess(filename, folder) {
  log(' My custom success');
  $('form img').attr('src', 'img/done.gif');
  setTimeout(function(){
  	console.log('timeout');
  	$('form img').fadeOut(500, function(){
  		$('#label').fadeIn(700);
  		$('#label p').remove();
  		$('#label').css('font-size', '50px');
  		$('#label i').css('display', 'inline-block');
  		$('.download').removeAttr('style');
  	});
  	document.getElementById('send').disabled = false;
  }, 2000);
  writeUserData(folder, filename);
};

function onError() {
  log('My custom error');
  $('img').attr('src', 'img/lol.gif');
  document.getElementById('send').disabled = false;
};

function onProgress(snapshot) {
  var percent = parseInt( (snapshot.bytesTransferred / snapshot.totalBytes)*100 );
  log("progress " + percent + '% / ' + snapshot.totalBytes);
  $('.dnl-progress').css('width', percent + '%');
  $('.dnl-progress').text(percent + '%');
  $('.download').css('display', 'block');

  	$('#label').css('display', 'none');
	$('#file').css('display', 'none');
	$('form img').remove();
	$('form').prepend('<img src=\'img/waiting-circle.gif\' style=\"height: 200px;\">');
	document.getElementById('send').disabled = true;
};

function generateKey(length) {

	var possible = 'ABSCEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var key = '';
	for( var i = 0; i < length; i++ ) {
		key += possible.charAt( Math.floor(Math.random() * possible.length) );
	}
	return key;
}

function writeUserData(folder, name) {
	var number;
	var el;
	firebase.database().ref('files/' + folder).once('value').then(function(snapshot) {
		number = Object.size(snapshot.val());
		console.log('update data');
		el = 
			'<li name=\"'+ number +'\"">' + 
				name + 
			'<div class=\"icon-wrap text-right\">' + 
					'<i class=\"fas fa-trash-alt\"><span class=\"tooltip\">Видалити файл</span></i>' +
			'</div></li>';
		// $('.file-list ul').empty();
		//document.getElementById('template').remove();
		var elem = document.querySelectorAll('.template');
		elem.forEach(function(el) {
			if (el) {
				// elem.remove();
				console.log('elem ' + el + ' is removed from the DOM');
				el.remove();
			}
		}); 
			
		$('.file-list ul').append(el);
		dataObj = {};
		dataObj[number] = name;
		console.log('writeUserData: name = ', name);
		// there should be pushed date of creating
		dataObj['CreateDate'] = new Date();
		firebase.database().ref('files/' + folder).update( dataObj );
		 
	}).catch(function(error){
		console.log('some error in writing data in database');
		showErrorMSG('writting data in database', error);
	});
};
