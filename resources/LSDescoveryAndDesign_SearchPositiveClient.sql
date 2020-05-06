
select tei_client.uid

, ( CASE WHEN ( "R9Lw1uNtRuj".value is null ) THEN ' ' ELSE ' ' || "R9Lw1uNtRuj".value END ) as firstname
, ( CASE WHEN ( "TBt2a4Bq0Lx".value is null ) THEN ' ' ELSE ' ' || "TBt2a4Bq0Lx".value END ) as lastname
, ( CASE WHEN ( "BvsJfkddTgZ".value is null ) THEN ' ' ELSE ' ' || "BvsJfkddTgZ".value END ) as birthdate
, ( CASE WHEN ( "u57uh7lHwF8".value is null ) THEN ' ' ELSE ' ' || "u57uh7lHwF8".value END ) as birthdistrict
, ( CASE WHEN ( "vTPYC9BXPNn".value is null ) THEN ' ' ELSE ' ' || "vTPYC9BXPNn".value END ) as birthorder
, pi_client.enrollmentdate
, max( event.executiondate ) as event

from trackedentityinstance as tei_client

inner join programinstance as pi_client
	on tei_client.trackedentityinstanceid = pi_client.trackedentityinstanceid

left outer join programstageinstance as event
	on pi_client.programinstanceid = event.programinstanceid

inner join program as prg 
	on prg.programid = pi_client.programid

-- firstname
left outer join ( select _teav.trackedentityinstanceid, _teav.value
		from trackedentityattributevalue _teav
			inner join trackedentityattribute _tea on _teav.trackedentityattributeid=_tea.trackedentityattributeid
		where _tea.uid='R9Lw1uNtRuj' ) as "R9Lw1uNtRuj"
	on "R9Lw1uNtRuj".trackedentityinstanceid = tei_client.trackedentityinstanceid

-- lastname
left outer join ( select _teav.trackedentityinstanceid, _teav.value
		from trackedentityattributevalue _teav
			inner join trackedentityattribute _tea on _teav.trackedentityattributeid=_tea.trackedentityattributeid
		where _tea.uid='TBt2a4Bq0Lx' ) as "TBt2a4Bq0Lx" 
	on "TBt2a4Bq0Lx".trackedentityinstanceid = tei_client.trackedentityinstanceid

-- birthdate
left outer join ( select _teav.trackedentityinstanceid, _teav.value
		from trackedentityattributevalue _teav
			inner join trackedentityattribute _tea on _teav.trackedentityattributeid=_tea.trackedentityattributeid
		where _tea.uid='BvsJfkddTgZ' ) as "BvsJfkddTgZ" 
	on "BvsJfkddTgZ".trackedentityinstanceid = tei_client.trackedentityinstanceid

-- district
left outer join ( select _teav.trackedentityinstanceid, _teav.value
		from trackedentityattributevalue _teav
			inner join trackedentityattribute _tea on _teav.trackedentityattributeid=_tea.trackedentityattributeid
		where _tea.uid='u57uh7lHwF8' ) as "u57uh7lHwF8" 
	on "u57uh7lHwF8".trackedentityinstanceid = tei_client.trackedentityinstanceid

-- birth order
left outer join ( select _teav.trackedentityinstanceid, _teav.value
		from trackedentityattributevalue _teav
			inner join trackedentityattribute _tea on _teav.trackedentityattributeid=_tea.trackedentityattributeid
		where _tea.uid='vTPYC9BXPNn' ) as "vTPYC9BXPNn" -- district
	on "vTPYC9BXPNn".trackedentityinstanceid = tei_client.trackedentityinstanceid


where prg.uid='KDgzpKX3h2S' 

and  replace( ( CASE WHEN ( "R9Lw1uNtRuj".value is null ) THEN ' ' ELSE ' ' || "R9Lw1uNtRuj".value END )  , '''', '-')   
		ilike '%${R9Lw1uNtRuj}%'
and  replace( ( CASE WHEN ( "TBt2a4Bq0Lx".value is null ) THEN ' ' ELSE ' ' || "TBt2a4Bq0Lx".value END ) , '''', '-') 
		ilike '%${TBt2a4Bq0Lx}%'		
and  replace( ( CASE WHEN ( "BvsJfkddTgZ".value is null ) THEN ' ' ELSE ' ' || "BvsJfkddTgZ".value END ) , '''', '-') 
		ilike '%${BvsJfkddTgZ}%'
and  replace( ( CASE WHEN ( "u57uh7lHwF8".value is null ) THEN ' ' ELSE ' ' || "u57uh7lHwF8".value END ) , '''', '-') 
		ilike '%${u57uh7lHwF8}%'		
and  replace( ( CASE WHEN ( "vTPYC9BXPNn".value is null ) THEN ' ' ELSE ' ' || "vTPYC9BXPNn".value END ) , '''', '-') 
		ilike '%${vTPYC9BXPNn}%'
and	 event.eventdatavalues  -> 'UuKat0HFjWS' -> 'value' > '"\"Positive\""'
		
	
group by tei_client.uid, "R9Lw1uNtRuj".value, "TBt2a4Bq0Lx".value
, "BvsJfkddTgZ".value, "u57uh7lHwF8".value
, "vTPYC9BXPNn".value, pi_client.enrollmentdate, tei_client.created

ORDER BY tei_client.created

