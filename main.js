
/*Skins and Styles*/
let buttonSkin = new Skin ({fill: 'green'});
let whiteSkin = new Skin ({fill: 'white'});
let blueSkin = new Skin ({fill: '#3498db'});
let silverSkin = new Skin ({fill: '#bdc3c7'});

let buttonStyle = new Style({font: '22px', color: 'white'});
let headlineStyle = new Style({font: '28px', color: '#aaaaaa'});
let smallStyle = new Style ({font: '20px', color: 'black'});


 /*
========================
Flickr:
========================
 */
 const FLICKRSTART = "https://api.flickr.com/services/rest/?";
 const MYFLICKRUSERID = "60346343@N06";
 const FLICKRAPIKEY = "b5ebd7807ea15f46892d4309b4ec9d73";
 const FLICKRAPISECRECT = "155015b672626031";

function createFlickrRequest(methodName){
  var requestURL = FLICKRSTART + "&method=" + methodName
                                + "&api_key=" + FLICKRAPIKEY 
                                + "&text=" + stringSplit(currentImageTitle, " ")
                                + "&format=json"
                                + "&nojsoncallback=1";
  return requestURL;
}
function createFlickrSourceUrl(imageId){
  var sourceURL = FLICKRSTART + "&method=flickr.photos.getSizes"
                                + "&api_key=" + FLICKRAPIKEY 
                                + "&photo_id=" + imageId
                                + "&format=json"
                                + "&nojsoncallback=1";
  return sourceURL;
}
function stringSplit(str, separator) {
    var wordArr = str.split(separator);
    var newStr = wordArr[0];
    if (wordArr.length > 1){
      for (var i = 1; i < wordArr.length; i++) {
        newStr = newStr + "_" + wordArr[i]
      }
    }
    return newStr;
}

function updateImageUI (comicUrl, comicTitle, comicNumber){
    let comicImg = new Picture({left: 0, right: 0, top: 0, bottom: 0, url: comicUrl});

    currentImageNumber = comicNumber;
    currentImageTitle = comicTitle;
    currentImageUrl = comicUrl;

    application.mainContainer[1].empty();
    application.mainContainer[1].add(comicImg);
    application.mainContainer.comicInfo.comicTitle.string = currentImageTitle;
    application.mainContainer.comicInfo.comicID.string = String(currentImageNumber);
}

/* Helper function for sending the HTTP request and loading the response */
function getFlickrImg(url, uiCallback) {
    var imageSource = "";
    var message = new Message(url);
    
    var promise = message.invoke(Message.JSON);
    promise.then(json => {
      if (0 == message.error && 200 == message.status) {
          try {
            var imageID = json.photos.photo[1].id;
            var imageUserID = json.photos.photo[1].owner;

            imageSource = createFlickrSourceUrl(imageID);
            trace(imageSource + '\n');
            message = new Message(imageSource);
            return message.invoke(Message.JSON);         
          }
          catch (e) {
            throw('Web service responded with invalid JSON!\n');
          }
      }
      else {
          trace('Request Failed - Raw Response Body: *' + '\n' +json+'*'+'\n');
      }
    }).then(json => {
      if (0 == message.error && 200 == message.status){
        try{
          trace(json.sizes.size[0].source + '\n');
          var sourceURL = json.sizes.size[0].source;
          uiCallback(sourceURL);
        }
        catch (e) {
            throw('Web service responded with invalid JSON!\n');
          }
      }
      else {
          trace('Request Failed - Raw Response Body: *' + '\n' +text+'*'+'\n');
      }
      
    });
}

let flickrButton = Container.template($ =>({
  exclusiveTouch: true, active: true, left: 5,
  contents:[
    Label($, { hidden: false, skin: $.skin, string: $.string, style: buttonStyle})
  ],
  behavior: Behavior({
    onTouchEnded: function(container, data){
      var url = createFlickrRequest("flickr.photos.search");
      getFlickrImg(url, function(url) {
        updateImageUI(url, currentImageTitle, "");
      });
    }
  })
}));

 /*
=====================================
XKCD Comic
=====================================
 */

/*Global Variable*/
var latestXKCDComicNumber;
var currentImageNumber;
var currentImageTitle;
var currentImageUrl;

var url = 'http://xkcd.com/info.0.json';

function getNextXKCDImgURL(imageNumber){
  return 'http://xkcd.com/' + imageNumber + '/info.0.json';
}

/*Set Up Application*/
application.behavior = Behavior({
  onLaunch: function(application){
    application.active = true;
    application.empty();
    let mainContainer = new MainContainer();
    mainContainer.name = "mainContainer";
    application.add(mainContainer);

    getImg(true, "", function(comicUrl, comicTitle, comicNumber) {
        let comicImg = new Picture({left: 0, right: 0, top: 0, bottom: 0, url: comicUrl});

        application.mainContainer.comicInfo.comicTitle.string = comicTitle;
        application.mainContainer.comicInfo.comicID.string = String(comicNumber);
        application.mainContainer[1].add(comicImg);
      });
  }
});

/* Main screen layout */
let MainContainer = Column.template($ => ({
    left: 0, right: 0, top: 0, bottom: 0, skin: whiteSkin,
    contents: [
      new Line({ 
          name: 'buttons',
          height: 50,
          contents: [
            new controlButton({skin: buttonSkin, string: "Previous"}),
            new controlButton({skin: buttonSkin, string: "Next"}),
            new controlButton({skin: buttonSkin, string: "Random"}),
            new flickrButton({skin: buttonSkin, string: "Flickr"})
          ]
      }),
      new ComicPane(),
      new Line({
        name: 'comicInfo', height: 50,
        contents: [
          new Label({name: "comicTitle", 
            // left: 0, right: 0, top: 0, bottom: 0,
            height: 50,
            string: "", style: smallStyle
          }),
          new Label({name: "comicID", 
            // left: 0, right: 0, top: 0, bottom: 0,
            height: 50,
            string: "", style: smallStyle
          })
        ]
      })
    ]
}));

let ComicPane = Container.template($ => ({
  name: 'comicPane',
  left: 0, right: 0, top: 0, bottom: 0, skin: silverSkin,
  contents: []
}));

let controlButton = Container.template($ =>({
  exclusiveTouch: true, active: true, left: 5,
  contents:[
    Label($, {
      hidden: false, skin: $.skin, string: $.string, style: buttonStyle
    })
  ],
  behavior: Behavior({
    onTouchEnded: function(container, data){
      var imageNumber;
      var validNext = true;
      if ($.string == "Next"){
        if (currentImageNumber < latestXKCDComicNumber){
          imageNumber = String(currentImageNumber + 1);
        }else{
          validNext = false;
        }
      }else if ($.string == "Random"){
        imageNumber = String(Math.round(Math.random()*latestXKCDComicNumber));
      }
      else {
          imageNumber = String(currentImageNumber - 1);
      }
      if (validNext){
        getImg(false, imageNumber, function(comicUrl, comicTitle, comicNumber) {
          updateImageUI(comicUrl, comicTitle, comicNumber, container);
        });
      }
    }
  })
}));

/* Helper function for sending the HTTP request and loading the response */
function getImg(bool, comicNumber, uiCallback) {
    if (comicNumber == ""){
      var url = 'http://xkcd.com/info.0.json';
    }else{
      var url = getNextXKCDImgURL(comicNumber);
    }
    var message = new Message(url);
    
    var promise = message.invoke(Message.JSON);
    promise.then(json => {
      if (0 == message.error && 200 == message.status) {
          try {
            currentImageUrl = json.img;
            currentImageTitle = json.title;
            currentImageNumber = json.num;
            if (bool){
              latestXKCDComicNumber = currentImageNumber;
            }

            uiCallback(currentImageUrl, currentImageTitle, currentImageNumber);           
          }
          catch (e) {
            throw('Web service responded with invalid JSON!\n');
          }
      }
      else {
          trace('Request Failed - Raw Response Body: *'+json+'*'+'\n');
      }
    });
}
