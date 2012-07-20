// ==UserScript==
// @id             manfre-ncww-forum-helper
// @updateUrl      http://userscripts.org/scripts/source/125648.user.js
// @name           NCWW Forum Helper
// @version        1.2b1
// @namespace      http://www.ncwoodworker.net
// @author         Michael Manfre
// @description    UI Improvements to the NCWW forum
// @homepage       https://github.com/manfre/scriptish-ncww-forum
// @domain         ncwoodworker.net
// @domain         www.ncwoodworker.net
// @include        /https?:\/\/(?:www\.)ncwoodworker.net\/.*/i
// @run-at         document-end
// @require        https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// ==/UserScript==

var icons = {
	collapse: '<img src="/forums/images/buttons/collapse_40b.png" style="width: 13px; height: 13px;" />',
	expand: '<img src="/forums/images/buttons/collapse_40b_collapsed.png" style="width: 13px; height: 13px;" />'
};

var ncww = {
	defaults: {
		event_collapse_timeout: 86400 * 3 * 1000 // 3 days in ms
	},
	
    init: function(){
    	ncww.load_settings();
        ncww.add_styles();
        
		ncww.collapse_upcoming_events();        
        ncww.cleanup_navbar();
        ncww.linkify_location(ncww.city);
        ncww.init_debug_toggle();
        ncww.hide_embedded_iframes();
        ncww.register_menus();
    },

    register_menus: function(){
        GM_registerMenuCommand('Configure NCWW Helper', ncww.update_city, 'c');
    },

    load_settings: function(){
        ncww.city = GM_getValue('city', '');
        ncww.event_collapse_timestamp = GM_getValue('event_collapse_timestamp', (new Date(0)).toISOString());
    },

    update_city: function(){
        ncww.city = prompt('Enter your City, State');
        GM_setValue('city', ncww.city);
        ncww.linkify_location(ncww.city);
    },
    
    add_styles: function(){
        GM_addStyle('.iframe-wrapper { border: 1px solid #ccc; background-color: #ffffee }');
        GM_addStyle('.iframe-wrapper a { margin-bottom: 5px; display: inline-block }');
    },
    
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
    },
    
    hide_embedded_iframes: function(){
        $('div[id^=post_message_] iframe').each(function(){
            var $this = $(this).hide(),
                src = $this.attr('src').replace('&output=embed', '') || '',
                toggler = $('<h3>Toggle Map</h3>').click(function(){ $this.toggle() }),
                link = $('<a href="' + src + '" target="_map" title="Open map in new window">' + src + '</a>');
                
            $this.wrap('<div class="iframe-wrapper" />').before(toggler).before(link);
        });
    },
    
    cleanup_navbar: function(){
    	$('#navbar').find('li:contains(Place Holder)').hide();
    },
    
    /*
    Add collapse button to events box. Choice is remembered for event_collapse_timeout days.
    */
    collapse_upcoming_events: function(){
    	var $this = $('.blockhead h2:contains(Special Events in the next 90 day)'),
    		$info = $this.parent().nextAll('.blockrow'),
    		auto_collapse = (new Date() - new Date(ncww.event_collapse_timestamp) <= ncww.defaults.event_collapse_timeout),
    		$collapse = $('<a href="#" class="collapse">' + icons.collapse + '</a>').toggle(function(){
    			$(this).html(icons.expand);
    			$info.hide();
    			// record timestamp of collapse outside of window
    			if (!auto_collapse)
	    			GM_setValue('event_collapse_timestamp', (new Date()).toISOString());
    		}, function(){
    			$(this).html(icons.collapse);
    			$info.show();
    			GM_setValue('event_collapse_timestamp', new Date(0).toISOString());
    			auto_collapse = false;
    		});
    	$this.parent().addClass('collapse').end().before($collapse);
    	
    	if (auto_collapse) $collapse.click();
    }
};



ncww.init();