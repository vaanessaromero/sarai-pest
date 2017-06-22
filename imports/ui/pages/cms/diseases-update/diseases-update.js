import { Plant_Problem } from '/imports/api/plant_problem/plant_problem.js';
import { CMS } from '/imports/api/cms/cms.js';
import { Meteor } from 'meteor/meteor';
import './diseases-update.html';
import '../components/cms-sidenav.html';

Template.diseasesUpdate.onCreated(function () {
	Meteor.subscribe('usersList');
	Meteor.subscribe('plant_problem.all');
	Meteor.subscribe('cms.all');
});

Template.diseasesUpdate.onRendered(function() {
	$('#viewChangesBTN').hide();
});

Template.diseasesUpdate.helpers({

	getCMS(){
		return CMS.findOne({info: "finalDiseases"});
	},

	diseaseType(){
		var data = Plant_Problem.find().fetch();
		var distinctData = _.uniq(data, false, function(d) {return d.plant_affected});
		return _.pluck(distinctData, "plant_affected");
	},

	isChecked(diseaseType) {
		return CMS.find({info: "finalDiseases", viewDiseaseType: diseaseType}).count() > 0? true : false;
	},

	isSelected(value, position){
		return value == position;
	},
});

var file;
var files = [];
Template.diseasesUpdate.events({
	'submit form': function(e, t){
        e.preventDefault();
		file = $('#userimage')[0].files[0];
		files.push(file);
    },  

	'click #saveBTN': function(event){
		event.preventDefault();
		var imgURL;
		var diseaseType = [];
		$( "input[type=checkbox]:checked" ).map(function() {
		    diseaseType.push($( this ).val());
		});
		
		Cloudinary.upload(file, function(err, res) {
          console.log("Upload Error: " + err);
          console.log("Upload Result: " + res);
          imgURL = res.public_id;
          Session.set('bannerImage', 'http://res.cloudinary.com/project-sarai/image/upload/' + imgURL);

			// GET THE VALUES
			var newCMS = {
				bannerImage: (Session.get('bannerImage') == undefined) ? CMS.findOne({info: "finalDiseases"}).bannerImage : Session.get('bannerImage'),
				bannerText : $("#bannerText").val(),
				bannerSubText : $("#bannerSubText").val(),
				searchlabel : $("#searchlabel").val(),
				diseaseNumbers : parseInt( $("#diseasesperpage").val() ),
				diseaseType : diseaseType
			}
			console.log("mico" + Session.get('bannerImage'));
			// UPDATES THE DATABASE
			Meteor.call('cms.updateDiseases', newCMS, (error) => {
		      if (error) {
		        alert(error.error);
		      } else {
		       	$('#cancelBTN').hide(); 
		       	$('#viewChangesBTN').show(); 
		      }
		    });
        });
	},

	'click #cancelBTN': function(event){
		event.preventDefault();
	},

	'click #viewChangesBTN': function(event){
		event.preventDefault();
		FlowRouter.go("/diseases");
	}, 
});