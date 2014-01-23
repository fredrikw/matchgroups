var sels = [], completedata = {}, matchedgroups = [], groupofpoints = [], individualpointlocation = [];
var xcol = 'Score', ycol = 'Vikt', indcol = 'Individ';

$(function()
{
        $('#parseText').click(function()
        {
                var results = $.parse($('#tb').val(), {'delimiter': '\t'});
                render(results);
        });

        $('#randomize').click(randomize);

        function render(results)
        {
        	var data = [];
        	sels = [], completedata = {}, matchedgroups = [], groupofpoints = [], individualpointlocation = [];
        	updateinfo();
			for(row in results.results.rows)
			{
				data.push([results.results.rows[row]['Score'], results.results.rows[row]['Vikt']]);
			}
			individualpointlocation = results.results.rows;
			completedata['Ungrouped'] = data;
			alldata = [{
        			label: 'Ungrouped', 
        			data: data, 
        			points: {show: true}, 
        			lines: { show: false}}];
        	var plot = $("#chartholder").plot(
        		alldata,
				{
					grid: {
						clickable: true
					}
				}).data("plot");
            $('#output').text(JSON.stringify(results, undefined, 2));
        }

        $("#chartholder").bind("plotclick", function (event, pos, item) {
			if (item) {
				var plot = $("#chartholder").data("plot");
				var alldata = plot.getData();
				var show = true;
				for(var ser in alldata)
				{
					for(var i in alldata[ser].data)
					{
						var pt = alldata[ser].data[i];
						if(pt[0] == item.datapoint[0] && pt[1] == item.datapoint[1])
						{
							var newsels = $.grep(sels, function(n) {
								var test = (n[0] == ser) && (n[1] == i);
								if(test)
									show = false;
								return !test;
							});
							if(show)
								sels.push([ser, i]);
							else
								sels = newsels;
						}
					}
				}
				updateinfo();
				if(show)
					plot.highlight(item.series, item.datapoint);
				else
					plot.unhighlight(item.series, item.datapoint);
			}
		});
	$('textarea[placeholdernl]').each(function(){
	    var $this = $(this),
	        value = $this.val(),
	        placeholder = $this.attr('placeholder');
	    $this.attr('placeholdernl', value ? value : placeholder);
	    $this.val('');
	    $this.focus(handleFocus).blur(handleBlur).trigger('blur');
	});
	$("#matchedgroup").change(selectedtreatmentgroup);
});

function updateinfo()
{
	$("#nofsels").text(sels.length);
	if((sels.length % $("#noftreatmentgroups").val()) == 0)
	{
		$("#nofsels").css('color', 'black');
		$("#matchedgroup").attr('disabled', false);
	}
	else
	{
		$("#nofsels").css('color', 'red');
		$("#matchedgroup").attr('disabled', true);
	}
}

handleFocus = function(){
    var $this = $(this);
    if($this.val() === $this.attr('placeholdernl')){
        $this.val('');
        $this.css('color', '');
    }
};

handleBlur = function(){
    var $this = $(this);
    if($this.val() == ''){
        $this.val($this.attr('placeholdernl'))
        $this.css('color', 'gray');
    }    
};

function selectedtreatmentgroup(evt)
{
	var $this = $(this);
	var plot = $("#chartholder").data("plot");
	var plotdata = plot.getData();
	if($this.val() == "new")
	{
		var newgroup = matchedgroups.length + 1;
		matchedgroups.push(newgroup);
		$("#matchedgroup option:eq(-1)").before("<option value='" + newgroup + "'>" + newgroup + "</option>");
		$this.val(newgroup);
	}
	var selectedgroup = $this.val();
	if(selectedgroup == +selectedgroup)
	{
		var oldgroup = completedata[selectedgroup] || [];
		for(var pt in sels)
		{
			var ptdata = sels[pt];
			ptdata[0] = plotdata[ptdata[0]].label;
			if(ptdata[0] != selectedgroup)
			{
				if(completedata[ptdata[0]])
				{
					var ptvals = completedata[ptdata[0]][ptdata[1]];
					delete completedata[ptdata[0]][ptdata[1]];
				}
				oldgroup.push(ptvals);
			}
		}
		completedata[selectedgroup] = oldgroup;
		sels = [];
		updateinfo();
		redrawgraph();
	}
}

function redrawgraph()
{
	plotdata = [];
	for(group in completedata)
	{
		plotdata.push({label: group, 
        			data: completedata[group], 
        			points: {show: true}, 
        			lines: { show: false}});
	}
	var plot = $("#chartholder").data("plot");
	plot.unhighlight();
	plot.setData(plotdata);
	plot.setupGrid();
	plot.draw();
}

function randomize()
{
	var nofungrouped = 0;
	for(i in completedata['Ungrouped'])
		if(completedata['Ungrouped'][i])
			nofungrouped++;
	console.log(nofungrouped);
	if(nofungrouped > 0)
	{
		var conf = confirm("You have " + nofungrouped + " ungrouped individuals, would you still like to continue?");
		if(!conf)
			return;
	}
	var individualsingroup = {};
	// Need to check that matchedgroups are of correct sizes before...
	for(var group in matchedgroups)
	{
		var mgroup = [];
		$(completedata[matchedgroups[group]]).each(function (i, element) {
			$(individualpointlocation).each(function (j, el2){
				if(el2 && el2[xcol] == element[0] && el2[ycol] == element[1])
				{
					delete individualpointlocation[j];
					mgroup.push(el2[indcol]);
					return false;
				}
			})
		});
		individualsingroup[matchedgroups[group]] = mgroup;
	}
	var treatmentgroups = [];
	var noftreatmentgroups = $("#noftreatmentgroups").val();
	for(var group in individualsingroup)
	{
		arrayshuffle(individualsingroup[group]);
		for(i in individualsingroup[group])
		{
			treatmentgroupno = i % noftreatmentgroups;
			if(treatmentgroups[treatmentgroupno])
				treatmentgroups[treatmentgroupno].push(individualsingroup[group][i]);
			else
				treatmentgroups[treatmentgroupno] = [individualsingroup[group][i]];
		}
	}
	var randomizeddiv = $("<div class=\"result\" id=\"randomized\"><h2>Randomized treatment groups</h2></div>");
	for(var group in treatmentgroups)
	{
		var tglist = $("<ul class=\"tglist\"></ul>");
		for(var ind in treatmentgroups[group])
		{
			tglist.append("<li>" + treatmentgroups[group][ind] + "</li>");
		}
		randomizeddiv.append("<h3>Treatment " + group + "</h3>").append(tglist);
	}
	$('#output').before(randomizeddiv).hide();
}

function arrayshuffle(a)
{
	var s = [];
	while (a.length) s.push(a.splice(Math.random() * a.length, 1)[0]);
	while (s.length) a.push(s.pop());
	return a;
}