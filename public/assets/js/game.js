$(document).ready(function(){
	var peer = null
	var peerId = null 
	var conn = null
	var opponent = {
		peerId: null
	}
	var turn = false
	var items = [
		[0,0,0],
		[0,0,0],
		[0,0,0]
	]
    var opeer = 0
	var hasWonRow = false
	var hasWonColumn    = false
	var hasWonDiagonal1 = false
	var hasWonDiagonal2 = false
	var winnerFound     = false
    var boardDimesion = 3
    var movesBeforeWin = (2*boardDimesion)-1
    totalMoves = boardDimesion*boardDimesion;
    var currentMoves = 0
    var id
    var didwin = false
    var peer1=0
    var peer2=0
    randomizeArray()
     function randomizeArray() {
    // Randomize the values in array
    for( i = 0; i < items.length ; i++) {
      var item = items[i];
      for( j = 0; j < item.length; j++ ) {
        item[j] = Math.random();
      }
    }  
  }






	
	function begin() {
		conn.on('data', function(data) {
			//console.log('hrr'+ data[0])
			//console.log('hr'+ data[1])
					if(turn) {
						return
					}
					var r = data[1]
					var c = data[2]
					 id = data[0]
                    currentMoves = data[3]
                    console.log(currentMoves)
					items[r][c] = id
                    //console.log(opponent.peerId)
                    //console.log('on receiving  :'+items[r][c])
					var s = "" + r + c
					$('#'+s).addClass('marked-x').attr({
						'data-select' : "selected",
						'data-marked' : "x"
					})
					turn = true
					if(currentMoves >= movesBeforeWin) {
                        process(id)
                    }
		})
		conn.on('close', function() {
			if(!ended) {
				$('#game .alert p').text('Opponent forfeited!')
			}
			turn = false
		})
		peer.on('error', function(err) {
			alert(''+err)
			turn = false
		})
	}

	function process( idi){
        //row
        for( i = 0; i < 3; i++) {
            if(hasWonRow == false) {
                hasWonRow = true;
                for( j = 0; j < 3; j++) {
                    
                    if(items[i][j] != items[i][0]) {
                        hasWonRow = false;
                        //console.log(items[i][j]);

                    } 
                }    
            }
            //console.log(i+'throw'+hasWonRow )
        }
        //column
        for( i = 0; i < items[0].length; i++) { 
            if(hasWonColumn == false) {
                hasWonColumn = true;
                for( j = 0; j < items[i].length; j++) {
                    //console.log(items[j][i]);
                    if(items[j][i] != items[0][i]) {
                        hasWonColumn = false;
                    }
                }    
            } 
        }
        //leftrightd
        hasWonDiagonal1 = true;
        for( i = 0; i < boardDimesion; i++) {
            //console.log(items[i][i]);
            if(items[i][i] != items[0][0]) {
                hasWonDiagonal1 = false;
            }
        }
        //rightleftd
        hasWonDiagonal2 = true;
        var squareSize = boardDimesion - 1;
        for( i = 0; i < boardDimesion ; i++) {
            //console.log(items[i][squareSize - i]);
            if(items[i][squareSize - i] != items[0][squareSize - 0]) {
                hasWonDiagonal2 = false;
            }
        }
        //winnig conditions
        
        if(hasWonRow == true || hasWonColumn == true || hasWonDiagonal1 == true || hasWonDiagonal2 == true) {
            console.log("SOMEBODY WONNN !!!")
            console.log(hasWonRow)
            console.log(hasWonColumn)
            console.log(hasWonDiagonal1)
            console.log(hasWonDiagonal2)
            didwin = true
            if(idi==peerId){
            	console.log('I have won')
            }else{
            	console.log('opponenthas won')
            }
            winnerFound = true
            for(i=0;i<3;i++){
                for(j=0;j<3;j++){
                    if(items[i][j]==id){
                        peer2++;
                    }else if(items[i][j]==peerId){
                        peer1++;
                    }
                }
            }
            console.log(peer1)
            console.log(peer2)
            if(peer1>peer2){
                console.log('peer1 won');
            }
        }
			
	}





	
	$('.grid').click(function(e){
		if(!turn){
			return
		}
        if(didwin == true){
            return
        }
		var $this = $(this)
		currentRow    = $this.data('row')
		currentColumn = $this.data('column')
		//console.log(currentRow)
		//console.log(currentColumn)
        if(currentMoves>9){
            /*for(i=0;i<3;i++){
                for(j=0;j<3;j++){
                    console.log(items[i][j])
                }
            }*/
            return
        }

        items[currentRow][currentColumn] = peerId
        //console.log('onclicking  :'+items[currentRow][currentColumn])

		$this.addClass('marked-o').attr({
			'data-select' : "selected",
			'data-marked' : "o"
		})
        currentMoves = currentMoves+1
        
        if(currentMoves >= totalMoves && winnerFound == false) {
            //$('.overlay .theMessage').text("It's a draw!");
            //showMainMessage();
            console.log('draw')
        }
        
		conn.send([peerId,currentRow,currentColumn,currentMoves])
		turn = false
        if(currentMoves >= movesBeforeWin) {
            process(peerId)
        }
		

	})



	function initialize() {
		peer = new Peer('', {
			host: location.hostname,
			port: location.port || (location.protocol === 'https:' ? 443 : 80),
			path: '/peerjs',
			debug: 3
		})
		peer.on('open', function(id) {
			peerId = id
		})
		peer.on('error', function(err) {
			alert(''+err)
		})

		// Heroku HTTP routing timeout rule (https://devcenter.heroku.com/articles/websockets#timeouts) workaround
		function ping() {
			//console.log(peer)

			peer.socket.send({
				type: 'ping'
			})
			setTimeout(ping, 16000)
		}
		ping()
	}



	function start() {
		initialize()
		peer.on('open', function() {
			console.log(peerId)
			//alert('Ask your friend to join using your peer ID: '+peerId)
		})
		peer.on('connection', function(c) {
			if(conn) {
				c.close()
				return
			}
			conn = c
			turn = true
			console.log('Your move!')
			begin()
		})
	}

	function join() {
		initialize()
		peer.on('open', function() {
			console.log('Your move!')
			var destId = prompt("Opponent's peer ID:")
			conn = peer.connect(destId, {
				reliable: true
			})
			conn.on('open', function() {
				opponent.peerId = destId
                opeer = opponent.peerId
                console.log(opponent.peerId)
				turn = false
				//conn.send('hi!');
				begin()
			})
		})
	}
	
	
	$('#start').on('click', function(event) {
		event.preventDefault()
		start()
	})
	$('#join').on('click', function(event) {
		event.preventDefault()
		join()
	})

	$('.start').click(function(e){
		e.preventDefault();
		$('.start-message').addClass('hide');
		$('.start-overlay').fadeOut('1000');
	});
	$('.join').click(function(e){
		e.preventDefault();
		$('.start-message').addClass('hide');
		$('.start-overlay').fadeOut('1000');
	});

	$('.message').on('click', '.play-again', function(e){
		e.preventDefault();
		location.reload();
	});

	

});