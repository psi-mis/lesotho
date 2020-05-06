select DISTINCT ON(pi.programinstanceid)
 tei.uid, psi.uid, psi.executiondate

, ( select value from trackedentityattributevalue _teav
				INNER JOIN trackedentityattribute _tea on _tea.trackedentityattributeid=_teav.trackedentityattributeid
				INNER JOIN trackedentityinstance _tei on _tei.trackedentityinstanceid=_teav.trackedentityinstanceid
			where pi.trackedentityinstanceid=_tei.trackedentityinstanceid
					and _tea.uid='rw3W9pDCPb2' ) as cuic

, ( select optval.name from trackedentityattributevalue _teav
				INNER JOIN trackedentityattribute _tea on _tea.trackedentityattributeid=_teav.trackedentityattributeid
				INNER JOIN trackedentityinstance _tei on _tei.trackedentityinstanceid=_teav.trackedentityinstanceid
				INNER JOIN optionset optset on optset.optionsetid=_tea.optionsetid
				INNER JOIN optionvalue optval on optval.optionsetid=optset.optionsetid
			where pi.trackedentityinstanceid=_tei.trackedentityinstanceid
					and _tea.uid='mYdfuRItatP' and optval.code=_teav.value ) as referralstatus

, ( select optval.name from trackedentityattributevalue _teav
				INNER JOIN trackedentityattribute _tea on _tea.trackedentityattributeid=_teav.trackedentityattributeid
				INNER JOIN trackedentityinstance _tei on _tei.trackedentityinstanceid=_teav.trackedentityinstanceid
				INNER JOIN optionset optset on optset.optionsetid=_tea.optionsetid
				INNER JOIN optionvalue optval on optval.optionsetid=optset.optionsetid
			where pi.trackedentityinstanceid=_tei.trackedentityinstanceid
					and _tea.uid='NLNTtpbT3c5' and optval.code=_teav.value ) as counsil
	

, artopeningfacility.value as facility
, contactlogEvent.eventdatavalues  -> 'wzM3bUiPowS' ->> 'value' as lastaction 
, contactlogEvent.executiondate as lastactiondate
, contactlogEvent.eventdatavalues  -> 'mcgzEFh5IV8' ->> 'value' as nextaction
, contactlogEvent.eventdatavalues  -> 'HcBFZsCt8Sy' ->> 'value' as nextactiondate
, extract(day from (
    date 'now()' - artopeningfacility.executiondate 
) )  as daySinceDiagnosis
, artclosureeventdata.programstageinstanceid as 	artclosureeventid
, artclosureeventdata.username as artclosureusername
, contactlogEvent.username as contactlogeventusername

from programstageinstance psi
inner join organisationunit org on org.organisationunitid=psi.organisationunitid
inner join programinstance pi on pi.programinstanceid=psi.programinstanceid
inner join trackedentityinstance tei on tei.trackedentityinstanceid=pi.trackedentityinstanceid

left outer join ( select optval.name as value, _pi.programinstanceid, artopeningevent.executiondate
		from programstageinstance artopeningevent
				inner join programinstance _pi on artopeningevent.programinstanceid=_pi.programinstanceid
				inner join programstage _pgs on _pgs.programstageid=artopeningevent.programstageid and _pgs.uid='OSpZnLBMVhr'
				inner join dataelement de on de.uid = 'E1KAxdya3y5' 
				INNER JOIN optionset optset on optset.optionsetid=de.optionsetid
				INNER JOIN optionvalue optval on optval.optionsetid=optset.optionsetid 
				and artopeningevent.eventdatavalues  -> 'E1KAxdya3y5' ->> 'value' > optval.code ) as artopeningfacility
	on artopeningfacility.programinstanceid=pi.programinstanceid

left outer join ( select _pi.programinstanceid, artclosureevent.programstageinstanceid, artclosureevent.executiondate, catOption.code as username
		from programstageinstance artclosureevent
				inner join programinstance _pi on artclosureevent.programinstanceid=_pi.programinstanceid
				inner join programstage _pgs on _pgs.programstageid=artclosureevent.programstageid and _pgs.uid='usEIFQODMxf'
				inner join categoryoptioncombo catoptcom on catoptcom.categoryoptioncomboid=artclosureevent.attributeoptioncomboid
				inner join categoryoptioncombos_categoryoptions catoptrls on catoptrls.categoryoptioncomboid=catoptcom.categoryoptioncomboid
				inner join dataelementcategoryoption catOption on catOption.categoryoptionid=catoptrls.categoryoptionid 
		) as artclosureeventdata
	on artclosureeventdata.programinstanceid=pi.programinstanceid
	
left outer join ( select contactlog.eventdatavalues, _pi.programinstanceid, contactlog.executiondate, catOption.code as username
		from programstageinstance contactlog
				inner join programinstance _pi on contactlog.programinstanceid=_pi.programinstanceid
				inner join dataelement de on de.uid = 'wzM3bUiPowS'
				inner join programstage _pgs on _pgs.programstageid=contactlog.programstageid and _pgs.uid='gmBozy0KAMC'
				inner join categoryoptioncombo catoptcom on catoptcom.categoryoptioncomboid=contactlog.attributeoptioncomboid
				inner join categoryoptioncombos_categoryoptions catoptrls on catoptrls.categoryoptioncomboid=catoptcom.categoryoptioncomboid
				inner join dataelementcategoryoption catOption on catOption.categoryoptionid=catoptrls.categoryoptionid
				 ) as contactlogEvent
	on contactlogEvent.programinstanceid=pi.programinstanceid
	

 where ( ( contactlogEvent.executiondate >= '${startDate}' and contactlogEvent.executiondate < '${endDate}' ) or ( artclosureeventdata.executiondate >= '${startDate}' and artclosureeventdata.executiondate < '${endDate}' ) )
 	and psi.programstageid in ( select _ps.programstageid 
				from programstage _ps where _ps.uid = '${stageId}' )
	and ( contactlogEvent.eventdatavalues  -> 'wzM3bUiPowS' ->> 'value' is not null or artclosureeventdata.programstageinstanceid is not null )
  and ( artclosureeventdata.username ='${username}' or contactlogEvent.username ='${username}' )
ORDER  BY pi.programinstanceid, psi.executiondate DESC 
