
/*Skins and Styles*/
let buttonSkin = new Skin ({fill: 'green'});
let whiteSkin = new Skin ({fill: 'white'});
// let blueSkin = new Skin ({fill: '#3498db'});
let silverSkin = new Skin ({fill: '#bdc3c7'});

//blue grey color scheme
let blueSkin = new Skin({fill: "#004489"});
let creamSkin = new Skin({fill: "#E1E1D6"});
let greyBlueSkin = new Skin({fill: "#D3D9DF"});
let greySkin = new Skin({fill: "#989898 "});
let darkGreySkin = new Skin({fill: "#565656"});
let creamGreySkin = new Skin({fill: "#DBDBCE"});
let homeButtonSkin = new Skin({fill: 'transparent',
                      borders: {left: 1, right: 1, top: 1, bottom: 1}, stroke: "white"})

let homeButtonStyle = new Style({font: '35px', color: 'white'});
let buttonStyle = new Style({font: '20', color: 'white'});
let headlineStyle = new Style({font: 'bold 50px', color: 'white'});
let xkcdTitleStyle = new Style({font: 'bold 20px', color: "#565656"});
let smallStyle = new Style ({font: 'bold 20px', color: 'black'});

var currentScreen;
var currentScreenName;




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
  var requestURL = FLICKRSTART 
                  + "&method=" + methodName
                  + "&api_key=" + FLICKRAPIKEY 
                  + "&text=" + stringSplit(currentImageTitle, " ")
                  + "&format=json"
                  + "&nojsoncallback=1";
  trace("image url: " + requestURL + '\n');
  return requestURL;
}
function createFlickrSourceUrl(imageId){
  var sourceURL = FLICKRSTART 
                  + "&method=flickr.photos.getSizes"
                  + "&api_key=" + FLICKRAPIKEY 
                  + "&photo_id=" + imageId
                  + "&format=json"
                  + "&nojsoncallback=1";
  trace("source url: " + sourceURL + '\n');
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

function updateImageUI (comicUrl, comicTitle){
    let comicImg = new Picture({left: 0, right: 0, top: 0, bottom: 0, url: comicUrl});

    currentImageTitle = comicTitle;
    currentImageUrl = comicUrl;

    application.mainContainer.image_buttons.comicPane.empty();
    application.mainContainer.image_buttons.comicPane.add(comicImg);

    // application.mainContainer[1].empty();
    // application.mainContainer[1].add(comicImg);
    application.mainContainer.comicInfo.comicTitle.string = currentImageTitle;
}

/* Helper function for sending the HTTP request and loading the response */
function getFlickrImg(url, uiCallback) {
    var imageSource = "";
    var message = new Message(url);
    
    var promise = message.invoke(Message.JSON);
    promise.then(json => {
      if (0 == message.error && 200 == message.status) {
          try {
            var numImages = json.photos.photo.length;
            var imageIndex = 0;
            trace("num images: " + String(numImages) + '\n');
            if (numImages == 0){
              trace("No Images Relating to Title." + '\n');
            }
            else{
              imageIndex = Math.round(Math.random()*numImages);
              if (imageIndex == 0){
                imageIndex = 1;
              }else if (imageIndex == numImages){
                imageIndex = imageIndex - 1;
              }
            }
            trace("Calculated Index: " + String(imageIndex) + '\n');
            var imageID = json.photos.photo[imageIndex].id;
            var imageUserID = json.photos.photo[imageIndex].owner;

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
          var numImOptions = json.sizes.size.length
          var sourceURL = json.sizes.size[0];
          for (var i = 0; i < numImOptions; i++){
            if (json.sizes.size[i].label == "Small"){
              sourceURL = json.sizes.size[i].source
              break
            }
          }
          trace("source url: " + sourceURL + '\n');
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
      // trace(url + '\n');
      getFlickrImg(url, function(url) {
        updateImageUI(url, currentImageTitle);
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

/*Home Screen Template*/
let homeContainer = Column.template($ =>({
  left: 0, right: 0, top: 0, bottom: 0, skin: blueSkin,
  contents:[
    new Text({name: "homeTitle",
      top: 30, left: 0, right: 0,
      string: "Welcome to XKCD Comics.",
      style: headlineStyle
    }),
    new Column({
      name: 'homeScreenButtons',
      height: 75,
      contents:[
        new homeButton({left: 0, right: 0, string: "   Search Flickr   "}),
        new homeButton({left: 0, right: 0, string: "   Explore XKCD   "})
      ]
    })
  ]

}));

/*Home Screen Buttons*/
let homeButton = Container.template($ =>({
  exclusiveTouch: true, active: true, 
  left: $.left, right: $.right, height: 75, bottom: 10,
  contents:[
    Label($, {
      hidden: false, skin: homeButtonSkin, string: $.string, style: homeButtonStyle
    })
  ],
  behavior: Behavior({
    onTouchEnded: function(container, data){
      if ($.string == "   Explore XKCD   "){
        application.empty();
        let mainContainer = new MainContainer();
        mainContainer.name = "mainContainer";
        currentScreenName = "mainContainer";
        currentScreen = mainContainer;
        application.add(mainContainer);

        getImg(true, "", function(comicUrl, comicTitle) {
          trace("image url: " + comicUrl + '\n');
          let comicImg = new Picture({left: 0, right: 0, top: 0, bottom: 0, url: comicUrl});
          application.mainContainer.image_buttons.comicPane.add(comicImg);
          application.mainContainer.comicInfo.comicTitle.string = comicTitle;
        });
      }else if ($.string == "   Search Flickr   "){

      }
      else {

      }
    }
  })
}));

/* Main screen layout */
let MainContainer = Column.template($ => ({
    left: 0, right: 0, top: 0, bottom: 0, skin: whiteSkin,
    contents: [
      new Column({
        name: 'comicInfo', height: 75,
        contents: [
          new Line({ 
              name: 'buttons',
              top: 5,
              contents: [
                new controlButton({skin: buttonSkin, string: "Previous"}),
                new controlButton({skin: buttonSkin, string: "Next"}),
                new controlButton({skin: buttonSkin, string: "Random"}),
                new flickrButton({skin: buttonSkin, string: "Flickr"})
              ]
            }),
          new Label({name: "comicTitle", 
            height: 50,
            string: "", style: xkcdTitleStyle
          })
        ]
      }),
      new Column({
        name: 'image_buttons',
        left: 0, right: 0, top: 5, bottom: 0,
        contents: [
          new ComicPane(),
          navBar
        ]
      })
    ]
}));

let ComicPane = Container.template($ => ({
  name: 'comicPane',
  left: 0, right: 0, top: 5, bottom: 0, skin: blueSkin,
  contents: []
}));

let controlButton = Container.template($ =>({
  exclusiveTouch: true, active: true, left: 5, top: 5,
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
          updateImageUI(comicUrl, comicTitle);
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
              trace(latestXKCDComicNumber);
            }

            uiCallback(currentImageUrl, currentImageTitle);           
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

/*
================
NavigationBar UI
================
*/

var NavButton = Container.template($ => ({
    active: true, top: 2, bottom: 2, right: 2, left: 2,
    name: $.name,
    behavior: Behavior({
        onCreate: function(content){
            this.upSkin = new Skin({
                fill: "#004489", 
                borders: {left: 1, right: 1, top: 1, bottom: 1}, 
                stroke: "white"
            });
            this.downSkin = new Skin({
                fill: "#D3D9DF", 
                borders: {left: 1, right: 1, top: 1, bottom: 1}, 
                stroke: "white"
            });
            content.skin = this.upSkin;
        },
        onTouchBegan: function(content){
            content.skin = this.downSkin;
        },
        onTouchEnded: function(content){
            if (content.name == "Search" && currentScreenName == "searchContainer"){
              if (currentScreenName == "searchContainer"){
                content.skin = this.upSkin;
              }else{

              }
            }else if (content.name == "XKCD"){
              if (currentScreenName == "mainContainer"){
                content.skin = this.upSkin;
              }else{

              }
            }else if (content.name == "Flickr"){
              if (currentScreenName == "flickrContainer"){
                content.skin = this.upSkin;
              }else{

              }
            }else{
              content.skin = this.upSkin;
              application.remove(currentScreen);  // Remove the old screen from the application
              currentScreen = new $.nextScreen;  // Make the new screen
              application.add(currentScreen);  // Add the new screen to the application
            }
        },
    }),
   contents: [
        Label($, { top: 0, bottom: 0, left: 0, right: 0, 
            style: new Style({ font: "15px", color: "white" }), 
            string: $.string})
   ]
}));

var navBar = new Line({ bottom: 0, height: 45, left: 0, right: 0,
    skin: new Skin({ fill: "black" }),
    contents: [
        new NavButton({ name: "Search", string: "Flickr Search", nextScreen: MainContainer }),
        new NavButton({ name: "XKCD", string: "XKCD Comic", nextScreen: MainContainer }),
        new NavButton({ name: "Flickr", string: "Related Flickr", nextScreen: MainContainer }),
    ]
});

/*Set Up Application*/
application.behavior = Behavior({
  onLaunch: function(application){
    application.active = true;
    application.empty();
    let homeScreen = new homeContainer();
    homeScreen.name = "homeScreen";
    currentScreen = homeScreen;
    application.add(homeScreen);
  }
});

