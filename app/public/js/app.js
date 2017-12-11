// grab the articles as a json
$.getJSON('/articles', function(data) {
  // for each one
  for (var i = 0; i<data.length; i++){
    // display the apropos information on the page
    var p=$("<div class='block'>");
     $(p).append("<h3 class='heading' data-id='" + data[i]._id+ "'>"+ data[i].title + "<button class='save'>Saved Article</button></h3><p>"+data[i].link + "</p>");

    $("#articles").append(p);
  }
});




$.getJSON("/api/saved", function(data) {
  $("#notes").empty();

//$("#notes").html("<button class='note' class='btn btn-success'>"+"ARTICLE NOTE"+"</button>");
  for (var i = 0; i < data.length; i++) {    
    
var p=$("<div class='block1' data-id='" + data[i]._id+"'>");
    
     $(p).append("<h3 class= 'heading1' data-id='" + data[i]._id + "'>" + data[i].title  + "</h3>"+ "<p>"+data[i].link+"<p>");
      $(p).append("<button class='delete' data-id='" + data[i]._id + "'>"+"DELETE FROM SAVED"+"</button><br>");
      //$(p).append("<button class='note' data-id='" + data[i]._id + "'>"+ "ARTICLE NOTE"+"</button>");
    

//$(p).append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $(p).append("<textarea data-id='" + data[i]._id +" 'id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $(p).append("<br><button data-id='" + data[i]._id + "' id='savenote' type=button' class='btn'>Save Note</button><button data-id='" + data[i]._id + "' id='deletenote' type='button' class='btn hide'>Delete Note</button></div>");
      
 


    $("#notes").append(p);   

    if(data.note){
      
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      
    }
  }

});
$(document).on('click', '.delete', function(){
var thisId = $(this).attr('data-id');
 $(this).parent().remove();
var objectId = {"_id": thisId};
$.ajax({
    method: "POST",
    url: "/api/deletesaved/"+thisId,
     //data: objectId
  })
    // with that done, add the note information to the page
    .done(function( data ) {
      console.log(data);       
    });
});




// whenever someone clicks a h3 tag
$(document).on('click', 'h3', function(){
  // empty the notes from the note section
 
  // save the id from the p tag
  var thisId = $(this).attr('data-id');
var objectId = {"_id": thisId};
  // now make an ajax call for the Article
  $.ajax({
    method: "POST",
    url: "api/saved",
     data: objectId
  })
    // with that done, add the note information to the page
    .done(function( data ) {
      console.log(data);

       $('#notes').empty();
    });
});


$(document).on('click', '#deletenote', function(){

   $('#deletenote').addClass('hide');
    $('#savenote').removeClass('hide');
  var thisId = $(this).attr('data-id');

  console.log(thisId);
  // run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/deletenote/" + thisId 
    
  })
    // with that done
    .done(function() {
     
        $('#bodyinput').val("");
    });  
});

// when you click the savenote button
$(document).on('click', '#savenote', function(){
    $('#deletenote').removeClass('hide');
    $('#savenote').addClass('hide');
  //$("#savenote").on("click", function(){
  // grab the id associated with the article from the submit button
  var thisId = $(this).attr('data-id');
  console.log(thisId);
  
var objectId = {"_id": thisId,"body":$('#bodyinput').val()};
  // run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/"+thisId,
   
    
    data: objectId
  })
    // with that done
    .done(function( data ) {
      // log the response
      console.log(data);
     
    });

});