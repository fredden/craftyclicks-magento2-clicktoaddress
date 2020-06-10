function activate_cc_m2(){
	jQuery('[name="postcode"]').each(function(index,elem){
		if(jQuery(elem).data('cc_attach') != '1' && !jQuery(elem).prop('disabled')){
			jQuery(elem).data('cc_attach','1');
			var form = jQuery(elem).closest('fieldset');

			var tmp_html = '<div class="admin__field"><label class="admin__field-label">'+c2a_config.autocomplete.texts.search_label+'</label><div class="admin__field-control"><input class="cc_search_input admin__control-text" type="text"/></div></div>';
			form.find('[name="street[0]"]').closest('div.admin__field').before( tmp_html );

			cc_holder.attach({
				search:		form.find('.cc_search_input')[0],
				company:	form.find('[name="company"]')[0],
				line_1:		form.find('[name="street[0]"]')[0],
				line_2:		form.find('[name="street[1]"]')[0],
				postcode:	form.find('[name="postcode"]')[0],
				town:		form.find('[name="city"]')[0],
				county:		{
					input:	form.find('[name="region"]'),
					list:	form.find('[name="region_id"]')
				},
				country:	form.find('[name="country_id"]')[0]
			});
			cc_index++;
		}
	});
}

var cc_holder = null;
requirejs(['jquery'], function( $ ) {
	jQuery( document ).ready(function() {
		if(!c2a_config.main.enable_extension){ return; }
		if(c2a_config.autocomplete.enabled && c2a_config.main.key != null){
			var config = {
				accessToken: c2a_config.main.key,
				onSetCounty: function(c2a, elements, county){
					if ("createEvent" in document) {
						var evt = document.createEvent("HTMLEvents");
						evt.initEvent("change", false, true);
						elements.country.dispatchEvent(evt);
					}
					else
						elements.country.fireEvent("onchange");
					c2a.setCounty(elements.county.list[0], county);
					c2a.setCounty(elements.county.input[0], county);
				},
				domMode: 'object',
				gfxMode: c2a_config.autocomplete.gfx_mode,
				style: {
					ambient: c2a_config.autocomplete.gfx_ambient,
					accent: c2a_config.autocomplete.gfx_accent
				},
				onResultSelected: function(c2a, elements, address){
					switch(address.country_name) {
						case 'Jersey':
							jQuery(elements.country).val('JE')
							break;
						case 'Guernsey':
							jQuery(elements.country).val('GG')
							break;
						case 'Isle of Man':
							jQuery(elements.country).val('IM')
							break;
						default:
							jQuery(elements.country).val(address.country.iso_3166_1_alpha_2);
					}
					jQuery(elements.country).trigger('change');
					jQuery(elements.company).trigger('change');
					jQuery(elements.line_1).trigger('change');
					jQuery(elements.line_2).trigger('change');
					jQuery(elements.postcode).trigger('change');
					jQuery(elements.town).trigger('change');
					jQuery(elements.county.input).trigger('change');
					jQuery(elements.county.list).trigger('change');
				},
				showLogo: false,
				texts: c2a_config.autocomplete.texts,
				transliterate: c2a_config.autocomplete.advanced.transliterate,
				debug: c2a_config.autocomplete.advanced.debug,
				cssPath: false,
				tag: 'Magento 2 - int'
			};
			if(typeof c2a_config.autocomplete.enabled_countries !== 'undefined'){
				config.countryMatchWith = 'iso_2';
				config.enabledCountries = c2a_config.autocomplete.enabled_countries;
			}
			if(c2a_config.autocomplete.advanced.lock_country_to_dropdown){
				config.countrySelector = false;
				config.onSearchFocus = function(c2a, dom){
					var currentCountry = dom.country.options[dom.country.selectedIndex].value;
					if(currentCountry !== ''){
						var countryCode = getCountryCode(c2a, currentCountry, 'iso_2');
						c2a.selectCountry(countryCode);
					}
				};
			}

			cc_holder = new clickToAddress(config);
			setInterval(activate_cc_m2,200);
		}

		if(c2a_config.autocomplete.enabled && c2a_config.main.key == null){
			console.warn('ClickToAddress: Incorrect token format supplied');
		}
	});
});
