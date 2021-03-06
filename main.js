import {
    SystemKeyboard
} from 'keyboard';
import {
    FieldScrollerBehavior,
    FieldLabelBehavior
} from 'field';

/*Skins and Styles*/
let buttonSkin = new Skin ({fill: "#004489", borders:{left: 1, right: 1, bottom: 1, top: 1}, stroke: "#989898"});
let whiteSkin = new Skin ({fill: 'white'});
let silverSkin = new Skin ({fill: '#bdc3c7'});

let blueSkin = new Skin({fill: "#004489"});
let creamSkin = new Skin({fill: "#E1E1D6"});
let greyBlueSkin = new Skin({fill: "#D3D9DF"});
let greySkin = new Skin({fill: "#989898"});
let darkGreySkin = new Skin({fill: "#565656"});
let creamGreySkin = new Skin({fill: "#DBDBCE"});
let homeScreenButtonSkin = new Skin({fill: 'transparent',
                      borders: {left: 1, right: 1, top: 1, bottom: 1}, stroke: "white"})

let homeScreenButtonStyle = new Style({left: 6, right: 6, top: 6, bottom: 6, font: '35px', color: 'white'});
let buttonStyle = new Style({left: 2, right: 2, top: 2, bottom: 2, font: '20', color: 'white'});
let headlineStyle = new Style({font: 'bold 50px', color: 'white'});
let xkcdTitleStyle = new Style({font: 'bold 30px', color: "#565656"});
let noRelatedImagesStyle = new Style({font: 'bold 30px', color: 'white'});
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

  /*
=====================================
XKCD Comic
=====================================
 */
var latestXKCDComicNumber;
var currentImageNumber;
var currentImageTitle;
var currentImageUrl;
var currentFlickrImageUrl;
var url = 'http://xkcd.com/info.0.json';

function resetGlobalVariables (){
  var latestXKCDComicNumber;
  var currentImageNumber;
  var currentImageTitle;
  var currentImageUrl;
  var currentFlickrImageUrl;
  var url = 'http://xkcd.com/info.0.json';
}

function getNextXKCDImgURL(imageNumber){
  return 'http://xkcd.com/' + imageNumber + '/info.0.json';
}

function createFlickrRequest(methodName){
  var requestURL = FLICKRSTART 
                  + "&method=" + methodName
                  + "&api_key=" + FLICKRAPIKEY 
                  + "&text=" + stringSplit(currentImageTitle, " ")
                  + "&format=json"
                  + "&nojsoncallback=1";
  return requestURL;
}
function createFlickrSourceUrl(imageId){
  var sourceURL = FLICKRSTART 
                  + "&method=flickr.photos.getSizes"
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

function updateImageUI (imgUrl, comicTitle){
    let img = new Picture({left: 5, right: 5, top: 5, bottom: 5, url: imgUrl});

    currentImageTitle = comicTitle;
    currentImageUrl = imgUrl;

    application.mainContainer.image_buttons.comicPane.empty();
    application.mainContainer.image_buttons.comicPane.add(img);
    application.mainContainer.comicInfo.comicTitle.string = currentImageTitle;
}
function updateFlickrUI(bool, flickrImURL, xkcdImURL, xkcdTitle){
    currentImageTitle = xkcdTitle;
    currentImageUrl = xkcdImURL;
    currentFlickrImageUrl = flickrImURL;
    let xkcdImg = new Picture({left: 5, right: 5, top: 5, bottom: 5, url: xkcdImURL});
    application.flickrContainer.images.comicTitle.string = currentImageTitle;
    application.flickrContainer.images.comicPane.empty();
    application.flickrContainer.images.comicPane2.empty();
    application.flickrContainer.images.comicPane2.add(xkcdImg);

    if (bool){ //check if Flickr had any matching images
      let flickrImg = new Picture({left: 5, right: 5, top: 5, bottom: 5, url: flickrImURL});
      application.flickrContainer.images.comicPane.add(flickrImg);
    }else{
      var noRelatedImagesLabel = new Label({left: 0, right: 0, top: 0, bottom: 0,
        string: "No Matched Images", style: noRelatedImagesStyle});
      application.flickrContainer.images.comicPane.add(noRelatedImagesLabel);
    }
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
            trace("numImages: " + String(numImages) + '\n');
            if (numImages == 0){
              trace("No Images Relating to Title." + '\n');
              return ;
            }
            else{
              imageIndex = Math.round(Math.random()*numImages);
              if (imageIndex == 0){
                imageIndex = 1;
              }else if (imageIndex == numImages){
                imageIndex = imageIndex - 1;
              }
            }
            var imageID = json.photos.photo[imageIndex].id;
            var imageUserID = json.photos.photo[imageIndex].owner;

            imageSource = createFlickrSourceUrl(imageID);
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
          uiCallback(sourceURL, true);
        }
        catch (e) {
            // throw('Web service responded with invalid JSON!\n');
            uiCallback("", false);
          }
      }
      else {
          trace('Request Failed - Raw Response Body: *' + '\n' +text+'*'+'\n');
      }
      
    });
}
/*
====================
Home Screen Template
====================
*/
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
        new homeScreenButton({left: 0, right: 0, string: "Explore XKCD"})
      ]
    }),
    new HomeComicPane()
  ]

}));
/*
===================
Home Screen Buttons
===================
*/
let homeScreenButton = Container.template($ =>({
  exclusiveTouch: true, active: true, 
  left: $.left, right: $.right, height: 75, bottom: 10,
  contents:[
    Label($, {
      hidden: false, skin: homeScreenButtonSkin, string: $.string, style: homeScreenButtonStyle
    })
  ],
  behavior: Behavior({
    onTouchEnded: function(container, data){
      if ($.string == "Explore XKCD"){
        application.empty();
        let mainContainer = new MainContainer();
        mainContainer.name = "mainContainer";
        currentScreenName = "mainContainer";
        currentScreen = mainContainer;
        application.add(mainContainer);

        getImg(true, "", function(comicUrl, comicTitle) {
          let comicImg = new Picture({left: 5, right: 5, top: 5, bottom: 5, url: comicUrl});
          application.mainContainer.image_buttons.comicPane.add(comicImg);
          application.mainContainer.comicInfo.comicTitle.string = comicTitle;
        });
      }else if ($.string == "Search Flickr"){
        application.empty();
        let searchContainer = new SearchContainer();
        searchContainer.name = "searchContainer";
        currentScreenName = "searchContainer";
        currentScreen = searchContainer;
        application.add(searchContainer);
        getImg(true, "", function(comicUrl, comicTitle) {
          let comicImg = new Picture({left: 5, right: 5, top: 5, bottom: 5, url: comicUrl});
          application.searchContainer.search.comicPane.add(comicImg);
        });
      }
      else {

      }
    }
  })
}));
/*
=====================
Flickr Screen Layout
=====================
*/
let FlickrContainer = Column.template($ => ({
    left: 0, right: 0, top: 0, bottom: 0, skin: whiteSkin,
    contents:[
      new Column({
        name: 'images',
        left: 0, right: 0, top: 0, bottom: 0,
        contents:[
          new Line({
            left: 0, right: 0, top: 0, height: 20, 
            contents:[
              new homeButton({skin: buttonSkin, string: "Home"}),
              new Container({left: 0, right: 0}),
              new reloadFlickrButton()
            ]
          }),
          new Label({name: 'comicTitle', height: 35, string: "", style: xkcdTitleStyle}),
          new ComicPane(),
          new ComicPane2(),
          new Line({ bottom: 0, height: 45, left: 0, right: 0,
            skin: new Skin({ fill: "black" }),
            contents: [
              new NavButton({ name: "XKCD", string: "XKCD Comic", nextScreen: MainContainer }),
              new NavButton({ name: "Flickr", string: "Related Flickr", nextScreen: MainContainer })
            ]
          })
        ]
      })
    ]
}));
/* 
==================
Main screen layout
==================
 */
let MainContainer = Column.template($ => ({
    left: 0, right: 0, top: 0, bottom: 0, skin: whiteSkin,
    contents: [
      new Column({
        name: 'comicInfo',
        left: 0, right: 0,
        contents: [
          new homeButton({skin: buttonSkin, string: "Home"}),
          new Label({name: "comicTitle", 
            height: 35,
            string: "", style: xkcdTitleStyle
          }),
          new Line({ 
              name: 'buttons',
              top: 15, skin: new Skin({fill: 'white'}),
              contents: [
                new controlButton({skin: buttonSkin, string: "Previous"}),
                new controlButton({skin: buttonSkin, string: "Next"}),
                new controlButton({skin: buttonSkin, string: "Random"})
              ]
            })
        ]
      }),
      new Column({
        name: 'image_buttons',
        left: 0, right: 0, top: 5, bottom: 0,
        contents: [
          new ComicPane(),
          new Line({ bottom: 0, height: 45, left: 0, right: 0,
            skin: new Skin({ fill: "black" }),
            contents: [
              new NavButton({ name: "XKCD", string: "XKCD Comic", nextScreen: MainContainer }),
              new NavButton({ name: "Flickr", string: "Related Flickr", nextScreen: MainContainer })
            ]
          })
        ]
      })
    ]
}));

/*
=====================
Comic Pane Templates:
=====================
*/

let ComicPane = Container.template($ => ({
  name: 'comicPane',
  left: 0, right: 0, top: 5, bottom: 0, skin: blueSkin,
  contents: []
}));
let HomeComicPane = Container.template($ => ({
  name: 'homeComicPane',
  left: 10, right: 10, top: 10, bottom: 10, skin: whiteSkin,
  contents: []
}));
let ComicPane2 = Container.template($ => ({
  name: 'comicPane2',
  left: 5, right: 5, height: 150, skin: whiteSkin,
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
          if (currentImageNumber > 0){
            imageNumber = String(currentImageNumber - 1);
          }else{
            validNext = false;
          }
      }
      if (validNext){
        getImg(false, imageNumber, function(comicUrl, comicTitle, comicNumber) {
          updateImageUI(comicUrl, comicTitle);
        });
      }
    }
  })
}));

let homeButton = Container.template($ =>({
  exclusiveTouch: true, active: true, left: 5, top: 5,
  contents:[
    Label($, { 
      hidden: false, skin: $.skin, string: $.string, style: buttonStyle
    })
  ],
  behavior: Behavior({
    onTouchEnded: function(container, data){
      application.delegate('onLaunch');
    }
  })
}));

let reloadFlickrButton = Container.template($ => ({
  exclusiveTouch: true, active: true, right: 5, top: 5,
  contents:[
    Label($, {
      hidden: false, skin: buttonSkin, string: "Reload Flickr Image", style: buttonStyle
    })
  ], 
  behavior: Behavior({
    onTouchEnded: function(container, data){
      let flickrImg = new Picture({left: 5, right: 5, top: 5, bottom: 5, url: currentFlickrImageUrl});
      application.flickrContainer.images.comicPane.empty();
      application.flickrContainer.images.comicPane.add(flickrImg);
    }
  })
}))

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
            if (content.name == "XKCD"){
              if (currentScreenName == "mainContainer"){
                content.skin = this.upSkin;
              }else{
                application.empty();
                let mainContainer = new MainContainer();
                mainContainer.name = "mainContainer";
                currentScreenName = "mainContainer";
                currentScreen = mainContainer;
                application.add(mainContainer);

                let comicImg = new Picture({left: 0, right: 0, top: 0, bottom: 0, url: currentImageUrl});
                application.mainContainer.image_buttons.comicPane.add(comicImg);
                application.mainContainer.comicInfo.comicTitle.string = currentImageTitle;
              }
            }else if (content.name == "Flickr"){
              var url = createFlickrRequest("flickr.photos.search");
              getFlickrImg(url, function(sourceURL, bool){
                application.empty();
                let flickrContainer = new FlickrContainer();
                flickrContainer.name = "flickrContainer";
                currentScreenName = "flickrContainer";
                currentScreen = flickrContainer;
                application.add(flickrContainer);
                updateFlickrUI(bool, sourceURL, currentImageUrl, currentImageTitle);
              });
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

/*Set Up Application*/
application.behavior = Behavior({
  onLaunch: function(application){
    application.active = true;
    application.empty();
    resetGlobalVariables();
    let homeScreen = new homeContainer();
    homeScreen.name = "homeScreen";
    currentScreen = homeScreen;
    application.add(homeScreen);
    var imageNumber = String(Math.round(Math.random()*latestXKCDComicNumber));
    getImg(false, "", function(comicUrl, comicTitle, comicNumber) {
      let img = new Picture({left: 5, right: 5, top: 5, bottom: 5, url: comicUrl});
      application.homeScreen.homeComicPane.empty();
      application.homeScreen.homeComicPane.add(img);
    });
  }
});

