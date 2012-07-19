// ==UserScript==
// @id             https://bitbucket.org/Manfre/scriptish-ncww-forum-helper
// @name           NCWW Forum Helper
// @version        1.0
// @namespace      http://www.ncwoodworker.net
// @author         Michael Manfre
// @description    UI Improvements to the NCWW forum
// @homepage       https://bitbucket.org/Manfre/scriptish-ncww-forum-helper
// @domain         ncwoodworker.net
// @domain         www.ncwoodworker.net
// @include        /https?:\/\/(?:www\.)ncwoodworker.net\/.*/i
// @run-at         document-idle
// @require        https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// ==/UserScript==

var ncww = {
    map_link: function(from, to, text){
        var q = from ? from + ' to ' + to : to;
        return '<a target="_map" href="http://maps.google.com/?q=' + encodeURIComponent(q) + '">' + text + '</a>';
    },
    
    linkify_location: function(city){
        // Linkify poster's location
        $('dl.userinfo_extra dt:contains(Location)').each(function(){
        	var loc = $(this).next();
        	var to = $.trim(loc.text());        	
        	loc.replaceWith('<dd>' + ncww.map_link(city, to, loc.text()) + '</dd>');
        });
        
        // User profile
        $('#view-aboutme .userprof_content h5:contains(Location Public)').each(function(){
            var $this = $(this),
                $dl = $this.siblings('dl'),
                u_city = $dl.find('dt:contains(City)').next().text(),
                u_state = $dl.find('dt:contains(State)').next().text(),
                u_county = $dl.find('dt:contains(County)').next().text(),
                to = [u_city, u_state, u_county].join(', '),
                map_link = 'Map To: ' + ncww.map_link(city, to, to);
            
            if ($this.data('map-set'))
                $('#aboutme-map-link').html(map_link);
            else {
                $this.after('<div id="aboutme-map-link">' + map_link + '</div>');
            }
        });

        // classifieds page
        $('title:contains(Classifieds: )').each(function(){
            var $this = $(this),
                item = $this.text().replace('Classifieds: ', '')
                loc = $('head meta[name=description]').attr('content').replace(item + ' For Sale', '');
            
            $('td.blockrow:contains(Product is located in:)').find('b').replaceWith('<b>' + ncww.map_link(city, loc, loc) + '</b>');
        });
        // classifieds listing
        $('input[id^=i1location]').each(function(){
            var $this = $(this),
                loc = $this.val();
            $this.parent().find('div:contains(' + loc + ')').html(ncww.map_link(city, loc, loc));
        });
    },
    
    init_debug_toggle: function(){
        $('#debuginfo').hide().before('<div id="toggledebug">Toggle Debug Info</div>');
        $('#toggledebug').click(function(){
        	$('#debuginfo').toggle();
        });
    }
};


var settings = {
    city: GM_getValue('city', 'Cary, NC'),
    update_city: function(){
        settings.city = prompt('Enter your City, State');
        GM_setValue('city', settings.city);
        ncww.linkify_location(settings.city);
    }
};

ncww.linkify_location(settings.city);
ncww.init_debug_toggle();

GM_registerMenuCommand('Configure NCWW Helper', settings.update_city, 'c');
