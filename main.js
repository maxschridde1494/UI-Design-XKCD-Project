/*
 * Homework
 */

/*Skins and Styles*/
let buttonSkin = new Skin ({fill: 'green'});
let whiteSkin = new Skin ({fill: 'white'});
let blueSkin = new Skin ({fill: '#3498db'});
let silverSkin = new Skin ({fill: '#bdc3c7'});

let buttonStyle = new Style({font: '22px', color: 'white'});
let headlineStyle = new Style({font: '28px', color: '#aaaaaa'});
let smallStyle = new Style ({font: '20px', color: 'black'});

// let comicPicUrl = 'http://imgs.xkcd.com/comics/solar_spectrum.png';
var url = 'http://xkcd.com/info.0.json';

/* Main screen layout */
let MainContainer = Column.template($ => ({
    left: 0, right: 0, top: 0, bottom: 0, skin: whiteSkin,
    contents: [
      new LoadButton(),
      new ComicPane(),
    ]
}));

let ComicPane = Container.template($ => ({
  name: 'comicPane',
  left: 0, right: 0, top: 0, bottom: 0, skin: silverSkin,
  contents: [

  ]
}));

let LoadButton = Container.template($ => ({
  left: 0, right: 0, top: 0, bottom: 0, skin: blueSkin,
  active: true,
  contents: [
    new Label({
      left: 0, right:0, top: 0, bottom: 0,
      style: buttonStyle,
      string: 'Load Comic'
    })
  ],
  behavior: Behavior({
    onTouchEnded(container, id, x, y, ticks) {
      getImg(function(comicUrl) {
        let comicImg = new Picture({height: 200, url: comicUrl});
        //FIXME: hard code, bad style, don't do this;
        container.container[1].add(comicImg);
      });
    }
  })
}));

/* Helper function for sending the HTTP request and loading the response */
function getImg(uiCallback) {
    var url = 'http://xkcd.com/info.0.json';
    /*** YOUR CODE HERE ***/
    
    message.invoke(Message.TEXT).then(text => {
      if (0 == message.error && 200 == message.status) {
          try {
            /*** YOUR CODE HERE ***/
            
          }
          catch (e) {
            throw('Web service responded with invalid JSON!\n');
          }
      }
      else {
          trace('Request Failed - Raw Response Body: *'+text+'*'+'\n');
      }
    });
}

/* Application definition */
let mainContainer = new MainContainer();
application.add(mainContainer);