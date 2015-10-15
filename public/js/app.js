var GamersChat = React.createClass({
	getInitialState: function() {
		return {
			messages: this.props.messages,
			user: this.props.user,
			showList: !this.isMobile()
		}
	},
	isMobile: function() {
		return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	},
	toggleList: function() {
		var showList = this.state.showList;
		this.setState({showList: !showList});
	},
	addMessage: function(message) {
		var messages = this.state.messages;
		messages.push(message);
		this.setState({ messages: messages });
	},
	handleUserSubmit: function(message) {
		this.addMessage(message);
		var botIndex = this.refs['playerList'].botHasBeenCalled(message.content);
		if (botIndex != null)
		{ // Bot has been called, find the answer
			this.refs['playerList'].handleBotAnswer(botIndex, message.content);
		}
	},
	handleGameStarted: function(name, game) {
		// Game started alert message in chat
		var message = {
			name: name,
			content: 'is now playing ' + game +'.',
			type: 'info'
		}
		this.addMessage(message);
	},
	handleNicknameChange: function(user) {
		this.setState({ user: user });
	},
	render: function() {
		var containerClasses = "st-container st-effect-sidebar",
			buttonClasses = "btn";
		if (this.state.showList) {
			containerClasses += " st-menu-open";
			buttonClasses += " active";
		}
		return (
			<div className={containerClasses}>
				<div className="st-pusher">
					<nav className="st-menu st-effect-sidebar">
						<PlayerList ref="playerList" players={this.props.players} user={this.state.user} statuses={this.props.statuses} knowledgeBase={this.props.knowledgeBase} onGameStarted={this.handleGameStarted} onNicknameChange={this.handleNicknameChange} onPlayerSubmit={this.handleNewPlayer} onBotSpeak={this.addMessage}/>
					</nav>
					<button id="show-list" className={buttonClasses} type="button" onClick={this.toggleList}><span className="glyphicon glyphicon-menu-right"></span><span className="glyphicon glyphicon-menu-left"></span></button>
					<div className="st-content">
						<div className="container-fluid fullHeight no-padding">
							<div className="row fullHeight">
								<div className="col-md-12 fullHeight">
									<MessageList messages={this.state.messages} />
									<MessageForm user={this.state.user} messageInput={this.state.messageInput} onMessageSubmit={this.handleUserSubmit} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

var PlayerList = React.createClass({
	lastCatIndex: -1,
	getInitialState: function() {
		return {
			user: this.props.user,
			players: this.props.players
		}
	},
	componentDidMount: function() {
		var players = this.sortPlayers(this.state.players);
		this.setState({players: players});
	},
	sortPlayers: function(players) {
		var sortPlayer = function(a, b) {
			if (a.status < b.status)
				return -1;
			if (a.status > b.status)
				return 1;
			return 0;
		}

		players.sort(sortPlayer);
		return players;
	},
	botHasBeenCalled: function(message) {
		// Find the bot name in the text
		for(var i = 0; i < this.state.players.length; i++) {
			if (message.toLowerCase().indexOf(this.state.players[i].name.toLowerCase()) > -1)
			{
				return i;
			}
		}

		return null;
	},
	handleBotAnswer: function(botIndex, message) {
		var that = this;
		var text = '';

		if (this.state.players[botIndex].name == "Hodor") { // Check if Hodor...
			text = 'Hodor.';
		} else { // Find a catchword
			var getCatchWord = function() {
				for(var categoryName in that.props.knowledgeBase)
				{
					var category = that.props.knowledgeBase[categoryName];
					if(category.catchWords)
					{
						for(var i = 0; i < category.catchWords.length; i++) {
							if (message.toLowerCase().indexOf(category.catchWords[i].toLowerCase()) > -1)
							{
								return categoryName;
							}
						}
					}
				}
				return null;
			}

			var category = getCatchWord();

			// Answer basically if no catchword found
			var answerPool = this.props.knowledgeBase.answers;
			if (category != null)
				answerPool = this.props.knowledgeBase[category].answers;

			var answerIndex = Math.floor(Math.random() * (answerPool.length - 1));
			text = answerPool[answerIndex];			
		}

		var message = {
			name: this.state.players[botIndex].name,
			content: text,
			type: 'chat'
		}
		
		setTimeout(function() {
			that.props.onBotSpeak(message);
		}, 1000);
	},
	handleNicknameChange: function(nickname) {
		var user = this.state.user;
		user.name = nickname;
		this.setState({ user: user });
		this.props.onNicknameChange(this.state.user);
	},
	handlePlayerSubmit: function(nickname) {
		// Choose a cat avatar
		var catIndex = (++this.lastCatIndex == 5) ? 0 : this.lastCatIndex;
		this.lastCatIndex = catIndex;
		
		var player = {
			name: nickname,
			status: 0,
			avatar: "cat"+catIndex+".jpg",
			game: null
		}

		var players = this.state.players;
		players.push(player);
		this.setState({players: this.sortPlayers(players)});
	},
	handleStatusChange: function(playerIndex, statusIndex) {
		var players = this.state.players;
		players[playerIndex].status = statusIndex;
		this.setState({players: this.sortPlayers(players)});
	},
	render: function() {
		var players = [];
		var that = this;

		this.state.players.forEach(function(player, index) {
			players.push(<Player key={player.name} index={index} player={player} isAI={true} knowledgeBase={that.props.knowledgeBase} statuses={that.props.statuses} onGameStarted={that.props.onGameStarted} onBotSpeak={that.props.onBotSpeak} onStatusChanged={that.handleStatusChange} />);
		});
		return (
			<div className="panel fullHeight">
				<div className="panel-heading">
					<ul id="user" className="list-group">
						<Player key={this.state.user.name} player={this.state.user} isAI={false} statuses={this.props.statuses} onNicknameChange={this.handleNicknameChange} />
					</ul>
				</div>
				<div className="panel-body">
					<ul className="list-group">
						{players}
					</ul>
					<PlayerForm players={this.state.players} user={this.state.user} onPlayerSubmit={this.handlePlayerSubmit} />
				</div>
			</div>
		);
	}
});

var PlayerForm = React.createClass({
	getInitialState: function() {
		return {
			addBot: false,
			nickname: ''
		}
	},
	handleSubmit: function(e) {
		e.preventDefault();
		var nicknameValid = true;
		for (var i = 0; i < this.props.players.length; i++) { // Nobody has the same nickname
			if(this.state.nickname.toLowerCase().trim() == this.props.players[i].name.toLowerCase().trim()) {
				nicknameValid = false;
				break;
			}
		}

		if (this.state.nickname.toLowerCase().trim() == this.props.user.name.toLowerCase().trim()) { // Even the user
			nicknameValid = false;
		}

		if (nicknameValid) {
			this.props.onPlayerSubmit(this.state.nickname);
			this.setState({ nickname: ''});
		}
	},
	cancelAddBot: function() {
		this.setState({ nickname: '', addBot: false });
	},
	handleNicknameChange: function() {
		this.setState({ nickname: this.refs.botNickname.value });
	},
	enableAddBot: function() {
		this.setState({ addBot: true });
	},
	render: function() {
		if (this.state.addBot)
			return (
				<div id="addBot">
					<form className="form-inline" onSubmit={this.handleSubmit}>
						<div className="input-group">
							<input type="text" className="form-control" placeholder="Enter a nickname" value={this.state.nickname} onChange={this.handleNicknameChange} ref="botNickname" />
							<span className="input-group-btn">
								<button className="btn btn-success" type="submit"><span className="glyphicon glyphicon-ok"></span></button>
								<button className="btn btn-danger" type="button" onClick={this.cancelAddBot}><span className="glyphicon glyphicon-remove"></span></button>
							</span>
						</div>
					</form>
				</div>
			);
		else
			return (
				<button id="buttonAddBot" className="btn btn-default" onClick={this.enableAddBot} type="button"><span className="glyphicon glyphicon-plus"></span> Add player</button>
			);
	}
});

var Player = React.createClass({
	lastNickname: null,
	getInitialState: function() {
		return {
			status: this.props.player.status,
			game: this.props.player.game,
			editNickname: false,
			nickname: this.props.player.name
		}
	},
	componentDidMount: function() {
		this.lastNickname = this.props.player.name;
		if(this.props.isAI) { // Init bot behaviors
			this.setBotPresenceBehavior();
			this.setBotSpeechBehavior();
		}
	},
	setBotPresenceBehavior: function() {
		var that = this;
		var statusNumber = this.props.statuses.length;

		//  The presence of each bot should change now and then
		var getPresenceInterval = function(isFirst) {
			// Change every 30 seconds to 180 seconds
			var min = 30, max = 180;
			if(isFirst)
			{ // Except for first change, faster.
				min = 15;
				max = 30;
			}
			return (Math.floor(Math.random() * max) + min) * 1000;
		}
		
		var botPresence = function() {
			var statusIndex = Math.floor(Math.random() * (statusNumber - 1));
			if(statusIndex == that.state.status)
			{// New status is the same so change it
				statusIndex = (statusIndex == (statusNumber - 1)) ? 0 : statusIndex + 1;
			}

			var games = that.props.statuses[statusIndex].games;
			if(games)
			{// Find a random game
				var gameIndex = Math.floor(Math.random() * (games.length - 1));
				that.handleGameChange(statusIndex, games[gameIndex]);
			}
			else
			{
				that.handleStatusChange(statusIndex);
			}

			setTimeout(botPresence, getPresenceInterval(false));
		}

		setTimeout(botPresence, getPresenceInterval(true));
	},
	isHodor: function() {
		return this.state.nickname == "Hodor";
	},
	getHodorSpeech: function() {
		// Compute a creative hodor sentence
		var text = '';
		var hodorTimes = Math.floor(Math.random() * 3);
		text = 'Hodor';
		for(var i = 0; i < hodorTimes; i++)
		{
			text += ', hodor';
		}
		text += '.';
		return text;
	},
	setBotSpeechBehavior: function() {
		var that = this;

		var discussionNumber = this.props.knowledgeBase.discussions.length;
		var lastDiscussionIndex = -1;

		var getSpeechInterval = function(isFirst) {
			// One bot will speak randomly between 15 seconds to 80 seconds
			var min = 15, max = 80;
			if(isFirst)
			{ // Except for first speak, faster.
				min = 1;
				max = 30;
			}
			return (Math.floor(Math.random() * max) + min) * 1000;
		}

		// The bots should speak once in a while
		var botSpeech = function() {
			var statusName = that.props.statuses[that.state.status].name;
			if (statusName != "Away" && statusName != "Playing")
			{// Do not speak if away or playing
				var text = '';
				if (that.isHodor()) {
					text = that.getHodorSpeech();
				} else {
					var discussionIndex = Math.floor(Math.random() * (discussionNumber - 1));
					if(discussionIndex == lastDiscussionIndex)
					{
						discussionIndex = (discussionIndex == (discussionNumber - 1)) ? 0 : discussionIndex + 1;
					}
					lastDiscussionIndex = discussionIndex;

					text = that.props.knowledgeBase.discussions[discussionIndex];
				}

				var message = {
					name: that.state.nickname,
					content: text,
					type: 'chat'
				}

				that.props.onBotSpeak(message);
			}

			setTimeout(botSpeech, getSpeechInterval(false));
		}

		// Speaks 5 seconds after application load
		setTimeout(botSpeech, getSpeechInterval(true));
	},
	handleStatusChange: function(status) {
		if(this.props.isAI)
		{// Send a message when status changing
			var oldStatusName = this.props.statuses[this.state.status].name
			var newStatusName = this.props.statuses[status].name;
			switch(newStatusName) {
				case "Away":
					var text = '';
					if (this.isHodor()) {
						text = this.getHodorSpeech();
					} else {
						var discussionIndex = Math.floor(Math.random() * (this.props.knowledgeBase.leaving.length - 1));
						text = this.props.knowledgeBase.leaving[discussionIndex];
					}

					var message = {
						name: this.state.nickname,
						content: text,
						type: 'chat'
					}
					this.props.onBotSpeak(message);
					break;
				case "Playing":
					break;
				case "Online":
					if (oldStatusName == "Away") {
						var text = '';
						if (this.isHodor()) {
							text = this.getHodorSpeech();
						} else {
							var discussionIndex = Math.floor(Math.random() * (this.props.knowledgeBase.comingBack.length - 1));
							text = this.props.knowledgeBase.comingBack[discussionIndex];
						}

						var message = {
							name: this.state.nickname,
							content: text,
							type: 'chat'
						}
						this.props.onBotSpeak(message);
					}
					break;
			}
		}

		this.setState({ status: status });
		this.setState({ game: null });
		if(this.props.isAI) {
			this.props.onStatusChanged(this.props.index, status);
		}
	},
	handleGameChange: function(status, game) {
		this.handleStatusChange(status);
		this.setState({ game: game });

		if(this.props.isAI)
		{// Send an info if game started
			this.props.onGameStarted(this.props.player.name, game);
		}
	},
	handleNicknameChange: function() {
		this.setState({ nickname: this.refs.nicknameInput.value });
	},
	handleNicknameSubmit: function(e) {
		e.preventDefault();
		if (this.state.nickname.replace(/\s/g, "").length > 0) { // Check if not empty
			this.props.onNicknameChange(this.state.nickname);
			this.changeEditNickname();
			this.lastNickname = this.state.nickname;
		}
	},
	changeEditNickname: function() {
		var editNickname = this.state.editNickname;
		this.setState({ editNickname: !editNickname });
	},
	cancelEditNickname: function() {
		this.setState({ nickname: this.lastNickname });
		this.changeEditNickname();
	},
	render: function() {
		var statuses = [];
		var that = this;
		this.props.statuses.forEach(function(status, index) {
			statuses.push(<Status key={index} index={index} status={status} onStatusChange={that.handleStatusChange} onGameChange={that.handleGameChange} />);
		});

		var nickname = <h4 className="media-heading">{this.state.nickname}</h4>;
		
		if(!this.props.isAI) {
			if (this.state.editNickname) {
				nickname = (
					<form className="form-inline" onSubmit={this.handleNicknameSubmit}>
						<div className="input-group">
							<input type="text" id="input-nickname" className="form-control" placeholder="Enter nickname" value={this.state.nickname} onChange={this.handleNicknameChange} ref="nicknameInput" />
							<span className="input-group-btn">
								<button className="btn btn-success" type="submit"><span className="glyphicon glyphicon-ok"></span></button>
								<button className="btn btn-danger" type="button" onClick={this.cancelEditNickname}><span className="glyphicon glyphicon-remove"></span></button>
							</span>
						</div>
					</form>
				);
			}
			else {
				nickname = <h4 className="media-heading">{this.state.nickname} <button className="btn btn-xs btn-default btn-edit" onClick={this.changeEditNickname}><span className="glyphicon glyphicon-pencil"></span></button></h4>;
			}
		}
		
		return (
			<li className="list-group-item">
				<div className="media">
  					<div className="media-left media-middle">
  						<img className="media-object" src={"img/" + this.props.player.avatar} />
  					</div>
  					<div className="media-body">
    					{nickname}
    					<div className="dropdown">
    						<span className={"glyphicon glyphicon-comment " + this.props.statuses[this.state.status].name.toLowerCase()}></span>
							<span className="playerStateName">{this.props.statuses[this.state.status].name} {this.state.game}</span>
							
							<button type="button" className="btn btn-xs btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							<span className="caret"></span>
							</button>
							<ul className="dropdown-menu">
								{statuses}
							</ul>
						</div>
    				</div>
    			</div>
			</li>
		);
	}
});

var Status = React.createClass({
	handleClick: function() {
		this.props.onStatusChange(this.props.index)
	},
	handleGameSelect: function(game) {
		this.props.onGameChange(this.props.index, game);
	},
	render: function() {
		if( this.props.status.games )
		{
			var games = [];
			var that = this;
			this.props.status.games.forEach(function(game, index) {
				games.push(<StatusGame key={index} game={game} onGameSelect={that.handleGameSelect} />);
			});
			return (
				/* I wanted to do something like this:
				<li role="separator" className="divider"></li>
				<li className="dropdown-header">{this.props.name}</li>
				{games}

				But apparently render must only return one html element. */
				<li>
					<ul className="list-group custom-dropdown">
						<li role="separator" className="divider"></li>
						<li className="dropdown-header">{this.props.status.name}</li>
						{games}
					</ul>
				</li>
			);
		}
		else
		{
			return (
				<li><a onClick={this.handleClick}>{this.props.status.name}</a></li>
			);
		}		
	}
});

var StatusGame = React.createClass({
	handleClick: function() {
		this.props.onGameSelect(this.props.game)
	},
	render: function() {
		return (
			<li><a onClick={this.handleClick}>{this.props.game}</a></li>
		);
	}
});

var MessageList = React.createClass({
	componentDidUpdate: function() {
		var node = this.refs.messagesList;
		node.scrollTop = node.scrollHeight;
	},
	render: function() {
		var messages = [];
		this.props.messages.forEach(function(message, index) {
			messages.push(<Message key={index} message={message} />);
		});
		return (
			<ul id="messages" className="list-group" ref="messagesList">
				{messages}
			</ul>
		);
	}
});

var Message = React.createClass({
	render: function() {
		var classes = "list-group-item";

		if (this.props.message.type == 'info')
			classes += " list-group-item-info"
		if (this.props.message.type == 'user')
			classes += " list-group-item-user"

		return (
			<li className={classes}>
				<div className="chatName floating">
					<span>{this.props.message.name}</span>
				</div>
				<div className="chatContent floating">
					<span>{this.props.message.content}</span>
				</div>
				<div style={{clear: "both"}}></div>
			</li>
		);
	}
});

var MessageForm = React.createClass({
	getInitialState: function() {
		return {
			messageInput: ''
		}
	},
	handleChange: function() {
		this.setState({ messageInput: this.refs.messageInput.value });
	},
	handleSubmit: function(e) {
		e.preventDefault();
		if(this.state.messageInput.replace(/\s/g, "").length > 0) { // Check if message not empty
			var message = {
				name: this.props.user.name,
				content: this.state.messageInput,
				type: 'user'
			}
			this.props.onMessageSubmit(message);
			this.setState({ messageInput: '' });
		}
	},
	render: function() {
		return (
			<form id="messageInput" className="form-inline" onSubmit={this.handleSubmit}>
				<div className="form-group fullWidth">
					<div className="input-group fullWidth">
						<span className="input-group-addon" id="sizing-addon1">{this.props.user.name}</span>
						<input type="text" className="form-control" placeholder="Enter your message here" value={this.state.messageInput} ref="messageInput" onChange={this.handleChange} />
						<span className="input-group-btn">
							<button className="btn btn-success fullWidth" type="submit">Send</button>
						</span>
					</div>
				</div>
			</form>
		);
	}
});

ReactDOM.render(
	<GamersChat players={window.PLAYERS} user={window.USER} messages={window.MESSAGES} statuses={window.STATUSES} knowledgeBase={window.KNOWLEDGEBASE}/>,
	document.getElementById('content')
);