'use strict';
class Googlagram {
  /**
   * @param id  element for map
   * @param lat
   * @param lng
   */
  constructor(id, lat , lng) {
    this.distance = 5000;
    this.center = new google.maps.LatLng(lat , lng);
    this.getMedia();

    var myOptions = {
      zoom: 10,
      center: this.center,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    this.map = new google.maps.Map(document.getElementById(id), myOptions);
    this.map.addListener('center_changed', this.updateMap.bind(this));
    this.markers = [];
    this.updateMap();
  }
  //using throttling to prevent big count of requests
  updateMap() {
    var _time = new Date().getTime();
    if(!this.last_update || _time - this.last_update > 2000){
      this.last_update = _time;
      this.center = this.map.getCenter();
      this.getMedia();
    }
  }
  clearMarkers (){
    for(var marker of this.markers){
      marker.setMap(null)
    }
    this.markers.length = 0;
  }
  createPhotoMarker (element){
    var marker = new google.maps.Marker({
      map: this.map,
      position:  new google.maps.LatLng(element.location.latitude, element.location.longitude),
      title: element.caption && element.caption.text,
      icon: {
        url: element.images.thumbnail.url,
        scaledSize: new google.maps.Size(50, 50), // scaled size
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(0,0)
      }
    });
    marker.element = element;
    marker.addListener('click',()=>{
      this.setLike(element);
    });
    this.markers.push(marker);
  }
  setLike(element){
    $.post(`/like/${element.id}`)
      .catch((e) =>{
          console.log(e);
      })
      .then((response) =>{
        console.log(response);
      })
  }
  getMedia(){
    $.getJSON("/media", {
        lat: this.center.lat(),
        lng: this.center.lng(),
      })
      .catch((e) =>{
        console.log(e);
      })
      .then((response) =>{
        this.clearMarkers();
        for(var el of response.data){
          this.createPhotoMarker(el);
        }
      })
  }
}
