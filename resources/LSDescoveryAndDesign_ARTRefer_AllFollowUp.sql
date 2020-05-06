
select tei.uid

, cuic.value

, ''

, ''

, extract(day from (
    date 'now()' - openartevent.executiondate 
) ) as daySinceDiagnosis 

, counsil.value

, openartevent.uid
, openartevent.executiondate

, facilityevent.facility
, facilityevent.facility_other


, contactevent.executiondate as lasteventdate
, contactevent.tedv_lastactionname
, contactevent.tedv_nextactionduedate
, contactevent.tedv_nextactionname

, contacteventwithusername.count

, _openartevent_username.username

, closearteventwithusername.executiondate
, closearteventwithusername.username
, closearteventwithusername.value


from trackedentityinstance tei
inner join programinstance pi 
			on pi.trackedentityinstanceid=tei.trackedentityinstanceid
inner join programstageinstance openartevent
			on openartevent.programinstanceid=pi.programinstanceid
inner join programstage stage 		
			on stage.uid='OSpZnLBMVhr'
					and stage.programid=pi.programid and openartevent.programstageid=stage.programstageid

-- ===================================

left outer join ( select _teav.value, _teav.trackedentityinstanceid  from trackedentityattributevalue _teav
				INNER JOIN trackedentityattribute _tea on _tea.trackedentityattributeid=_teav.trackedentityattributeid
			where _tea.uid='rw3W9pDCPb2' ) as cuic on tei.trackedentityinstanceid=cuic.trackedentityinstanceid 

left outer join ( select _teav.value, _teav.trackedentityinstanceid  from trackedentityattributevalue _teav
				INNER JOIN trackedentityattribute _tea on _tea.trackedentityattributeid=_teav.trackedentityattributeid
			where _tea.uid='NLNTtpbT3c5' ) as counsil on tei.trackedentityinstanceid=counsil.trackedentityinstanceid 
			
----------------------- Opening user created -----------------------

left outer join ( select catOption.code as username, _openartevent.programstageinstanceid
    from programstageinstance _openartevent 
		inner join programstage _stage 
			on _stage.programstageid = _openartevent.programstageid and _stage.uid='gmBozy0KAMC' 
		inner join categoryoptioncombo catoptcom on catoptcom.categoryoptioncomboid=_openartevent.attributeoptioncomboid
		inner join categoryoptioncombos_categoryoptions catoptrls on catoptrls.categoryoptioncomboid=catoptcom.categoryoptioncomboid
		inner join dataelementcategoryoption catOption 
			on catOption.categoryoptionid=catoptrls.categoryoptionid 
		where catOption.code = 'TES002' 
		group by catOption.code, _openartevent.programstageinstanceid
  ) as _openartevent_username 
	on _openartevent_username.programstageinstanceid = openartevent.programstageinstanceid 

----------------------- latest contact log event -----------------------

left outer join 
 ( select eventlatest.programinstanceid, eventlatest.programstageinstanceid, eventlatest.executiondate
	,eventlatest.eventdatavalues -> 'hjpNXAyZ0cm' ->> 'value' as tedv_lastactionname
	,eventlatest.eventdatavalues -> 'HcBFZsCt8Sy' ->> 'value' as tedv_nextactionduedate
	,eventlatest.eventdatavalues -> 'mcgzEFh5IV8' ->> 'value' as tedv_nextactionname
   from programstageinstance as eventlatest
		inner join programstage _stage on _stage.programstageid = eventlatest.programstageid and _stage.uid='gmBozy0KAMC' 
   order by eventlatest.executiondate desc  
   limit 1
 ) as contactevent -- contactevent_latest
 on pi.programinstanceid = contactevent.programinstanceid

----------------------- Check Contact log event with username -----------------------

left outer join ( select count( contactlogevent.executiondate ) as count, contactlogevent.programinstanceid
    from programstageinstance contactlogevent 
		inner join programstage _stage 
			on _stage.programstageid = contactlogevent.programstageid and _stage.uid='gmBozy0KAMC' 
		inner join categoryoptioncombo catoptcom on catoptcom.categoryoptioncomboid=contactlogevent.attributeoptioncomboid
		inner join categoryoptioncombos_categoryoptions catoptrls on catoptrls.categoryoptioncomboid=catoptcom.categoryoptioncomboid
		inner join dataelementcategoryoption catOption 
			on catOption.categoryoptionid=catoptrls.categoryoptionid 
		where catOption.code =  '${username}'
		group by contactlogevent.programinstanceid
  ) as contacteventwithusername 
	on pi.programinstanceid = contacteventwithusername.programinstanceid 

left outer join ( select catOption.code as username
		, closeartevent.eventdatavalues  -> 'nOK8JcDWT9X' ->> 'value' as value
		, closeartevent.programinstanceid, closeartevent.executiondate
    from programstageinstance closeartevent
		inner join programstage _stage 
			on _stage.programstageid = closeartevent.programstageid and _stage.uid='usEIFQODMxf' 
		inner join categoryoptioncombo catoptcom on catoptcom.categoryoptioncomboid=closeartevent.attributeoptioncomboid 
		inner join categoryoptioncombos_categoryoptions catoptrls on catoptrls.categoryoptioncomboid=catoptcom.categoryoptioncomboid 
		inner join dataelementcategoryoption catOption 
			on catOption.categoryoptionid=catoptrls.categoryoptionid 
  ) as closearteventwithusername 
	on pi.programinstanceid = closearteventwithusername.programinstanceid 

------------------------- Facility in Opening event -------------------------

-- Facility  
left outer join ( select _psi.eventdatavalues  -> 'E1KAxdya3y5' ->> 'value' as facility
	, _psi.eventdatavalues  -> 'CLclHLxzl9e' ->> 'value' as facility_other
	, _psi.programinstanceid
		from programstageinstance _psi
			inner join programstage _pgs on _pgs.programstageid=_psi.programstageid and _pgs.uid='OSpZnLBMVhr'
	) as facilityevent on pi.programinstanceid = facilityevent.programinstanceid


-- ===================================

group by tei.uid, tei.trackedentityinstanceid, openartevent.executiondate, cuic.value, counsil.value
,contactevent.executiondate,contactevent.tedv_lastactionname,contactevent.tedv_nextactionduedate, contactevent.tedv_nextactionname
,contacteventwithusername.count, closearteventwithusername.username
, facilityevent.facility
,openartevent.uid
,_openartevent_username.username
,closearteventwithusername.executiondate
,closearteventwithusername.value
, facilityevent.facility_other


