select -- DISTINCT ON(psi.organisationunitid, psi.programstageid)
 tei.uid as clientuid, psi.uid as eventtuid, psi.executiondate
 , psi.eventdatavalues  -> 'UuKat0HFjWS' ->> 'value'  as finaltesttesultdata_Value
, ( select value from trackedentityattributevalue _teav
				INNER JOIN trackedentityattribute _tea on _tea.trackedentityattributeid=_teav.trackedentityattributeid
				INNER JOIN trackedentityinstance _tei on _tei.trackedentityinstanceid=_teav.trackedentityinstanceid
			where pi.trackedentityinstanceid=_tei.trackedentityinstanceid
					and _tea.uid='rw3W9pDCPb2' ) as cuic

, ( select COUNT(_psi.programstageinstanceid) 
			from programstageinstance _psi
					inner join programinstance _pi on _pi.programinstanceid=_psi.programinstanceid
					inner join programstage _prgs on _prgs.programstageid=_psi.programstageid
			where _pi.programinstanceid=pi.programinstanceid
					and _prgs.uid='${stageId}' ) as noevent
, org.name

, ( select optval.name from trackedentityattributevalue _teav
				INNER JOIN trackedentityattribute _tea on _tea.trackedentityattributeid=_teav.trackedentityattributeid
				INNER JOIN trackedentityinstance _tei on _tei.trackedentityinstanceid=_teav.trackedentityinstanceid
				INNER JOIN optionset opts on opts.optionsetid=_tea.optionsetid
				INNER JOIN optionvalue optval on optval.optionsetid=opts.optionsetid
			where pi.trackedentityinstanceid=_tei.trackedentityinstanceid
					and _tea.uid='mYdfuRItatP' and _teav.value=optval.code ) as artstatus
				
, ( select _psi.eventdatavalues -> 'UuKat0HFjWS' -> 'value'
		from programstageinstance _psi
				INNER JOIN programstage _pgs on _pgs.programstageid=_psi.programstageid and _pgs.uid='OSpZnLBMVhr'
				INNER JOIN dataelement _de on _de.uid='UuKat0HFjWS'
				INNER JOIN optionset opts on opts.optionsetid=_de.optionsetid
				INNER JOIN optionvalue optval on optval.optionsetid=opts.optionsetid
		where _psi.programinstanceid=pi.programinstanceid
					and _psi.eventdatavalues  -> 'UuKat0HFjWS' -> 'value' is not null 
					and _psi.eventdatavalues -> 'UuKat0HFjWS' ->> 'value' > optval.code ) as artopeningfacility



from programstageinstance psi
inner join organisationunit org on org.organisationunitid=psi.organisationunitid
inner join programinstance pi on pi.programinstanceid=psi.programinstanceid
inner join trackedentityinstance tei on tei.trackedentityinstanceid=pi.trackedentityinstanceid
inner join categoryoptioncombo catoptcom on catoptcom.categoryoptioncomboid=psi.attributeoptioncomboid
inner join categoryoptioncombos_categoryoptions catoptrls on catoptrls.categoryoptioncomboid=catoptcom.categoryoptioncomboid
inner join dataelementcategoryoption catOption on catOption.categoryoptionid=catoptrls.categoryoptionid

 where psi.executiondate >= '${startDate}' and psi.executiondate < '${endDate}'
 	and psi.programstageid in ( select _ps.programstageid 
				from programstage _ps where _ps.uid = '${stageId}' )
	and catOption.code='${username}'
	and psi.eventdatavalues  -> 'UuKat0HFjWS' -> 'value' > '"\"Positive\""'

ORDER  BY psi.organisationunitid, psi.programstageid, psi.executiondate DESC

