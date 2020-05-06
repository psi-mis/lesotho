---  LSDescoveryAndDesign_loadCases 

select DISTINCT ON(pi.programinstanceid)
 tei_client.uid as clientuid, psi.uid as eventuid, psi.executiondate
-- , finaltesttesultdata.value
,  psi.eventdatavalues  -> 'UuKat0HFjWS' ->> 'value'  finaltesttesultdata_Value
, ( select value from trackedentityattributevalue _teav
				INNER JOIN trackedentityattribute _tea on _tea.trackedentityattributeid=_teav.trackedentityattributeid
				INNER JOIN trackedentityinstance _tei on _tei.trackedentityinstanceid=_teav.trackedentityinstanceid
			where tei_client.trackedentityinstanceid=_tei.trackedentityinstanceid
					and _tea.uid='rw3W9pDCPb2' ) as cuic

, ( select COUNT(_psi.programstageinstanceid) 
			from programstageinstance _psi
					inner join programinstance _pi on _pi.programinstanceid=_psi.programinstanceid
					inner join programstage _prgs on _prgs.programstageid=_psi.programstageid
			where _pi.programinstanceid=pi.programinstanceid
					and _prgs.uid='${stageId}' ) as noevent
, org.name

, psi.status

, ( select count(*)
			from trackedentityattributevalue _teav
				INNER JOIN trackedentityattribute _tea on _tea.trackedentityattributeid=_teav.trackedentityattributeid
					and _tea.uid in ( 'ZQiKIaeOKv4', 'Rl2hRelrfur', 'qynN2cqRe71', 'NLNTtpbT3c5', 'VRUFmF5tE7b' )
			where tei_client.trackedentityinstanceid=_teav.trackedentityinstanceid ) as contactlog_info

-- Heath Facility in [ART Opening] event
, artopening_event.programstageinstanceid

-- , artchecked.value
, psi.eventdatavalues  -> 'tUIkmIFMEDS' ->> 'value'  as artchecked_Value

-- Heath Facility in [PrEP Refer Opening] event
, prepreferopening_event.programstageinstanceid


from programstageinstance psi
inner join organisationunit org on org.organisationunitid=psi.organisationunitid
inner join programinstance pi on pi.programinstanceid=psi.programinstanceid
inner join trackedentityinstance tei_client on tei_client.trackedentityinstanceid=pi.trackedentityinstanceid
inner join categoryoptioncombos_categoryoptions catoptrls on catoptrls.categoryoptioncomboid=psi.attributeoptioncomboid
inner join dataelementcategoryoption catOption on catOption.categoryoptionid=catoptrls.categoryoptionid 
inner join program as prg on prg.programid = pi.programid


--left outer join ( select finaltestresult.value, finaltestresult.programstageinstanceid 
--		from trackedentitydatavalue as finaltestresult
--				inner join dataelement de on de.dataelementid=finaltestresult.dataelementid
--					and de.uid = 'UuKat0HFjWS' ) as finaltesttesultdata
--	on finaltesttesultdata.programstageinstanceid=psi.programstageinstanceid

--left outer join ( select finaltestresult.value, finaltestresult.programstageinstanceid 
--		from trackedentitydatavalue as finaltestresult
--				inner join dataelement de on de.dataelementid=finaltestresult.dataelementid
--					and de.uid = 'tUIkmIFMEDS' ) as artchecked
--	on artchecked.programstageinstanceid=psi.programstageinstanceid


left outer join ( select _psi.programinstanceid, _psi.programstageinstanceid
		from programstageinstance _psi
				inner join programstage _pgs on _pgs.programstageid=_psi.programstageid and _pgs.uid='OSpZnLBMVhr'
 ) as artopening_event on  artopening_event.programinstanceid=pi.programinstanceid


left outer join ( select _psi.programinstanceid, _psi.programstageinstanceid
		from programstageinstance _psi
				inner join programstage _pgs on _pgs.programstageid=_psi.programstageid and _pgs.uid='R5UixJ6WEAn'
 ) as prepreferopening_event on  prepreferopening_event.programinstanceid=pi.programinstanceid

 
where psi.executiondate >= '${startDate}' and psi.executiondate < '${endDate}'
 	and psi.programstageid in ( select _ps.programstageid 
				from programstage _ps where _ps.uid = '${stageId}' )
	and catOption.code='${username}'

	
ORDER  BY pi.programinstanceid, psi.executiondate DESC


