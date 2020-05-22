
select psi.uid, tei.uid as clientid , psi.executiondate
, ( select value from trackedentityattributevalue _teav
				INNER JOIN trackedentityattribute _tea on _tea.trackedentityattributeid=_teav.trackedentityattributeid
				INNER JOIN trackedentityinstance _tei on _tei.trackedentityinstanceid=_teav.trackedentityinstanceid
			where pi.trackedentityinstanceid=_tei.trackedentityinstanceid
					and _tea.uid='rw3W9pDCPb2' ) as cuic
, ( select value from trackedentityattributevalue _teav
				INNER JOIN trackedentityattribute _tea on _tea.trackedentityattributeid=_teav.trackedentityattributeid
				INNER JOIN trackedentityinstance _tei on _tei.trackedentityinstanceid=_teav.trackedentityinstanceid
			where pi.trackedentityinstanceid=_tei.trackedentityinstanceid
					and _tea.uid='R9Lw1uNtRuj' ) as firstname
, ( select value from trackedentityattributevalue _teav
				INNER JOIN trackedentityattribute _tea on _tea.trackedentityattributeid=_teav.trackedentityattributeid
				INNER JOIN trackedentityinstance _tei on _tei.trackedentityinstanceid=_teav.trackedentityinstanceid
			where pi.trackedentityinstanceid=_tei.trackedentityinstanceid
					and _tea.uid='TBt2a4Bq0Lx' ) as lastname
, psi.eventdatavalues  -> 'UuKat0HFjWS' ->> 'value'  as finaltest
					
from programstageinstance psi
inner join organisationunit org on org.organisationunitid=psi.organisationunitid
inner join programinstance pi on pi.programinstanceid=psi.programinstanceid
inner join trackedentityinstance tei on tei.trackedentityinstanceid=pi.trackedentityinstanceid
inner join categoryoptioncombo catoptcom on catoptcom.categoryoptioncomboid=psi.attributeoptioncomboid
inner join categoryoptioncombos_categoryoptions catoptrls on catoptrls.categoryoptioncomboid=catoptcom.categoryoptioncomboid
inner join dataelementcategoryoption catOption on catOption.categoryoptionid=catoptrls.categoryoptionid
inner join programstage pgs on  pgs.programstageid=psi.programstageid

where  psi.executiondate >= '${startDate}' and psi.executiondate < '${endDate}' 
 	and pgs.uid = '${stageId}'
	and catOption.code='${username}'
	and org.uid='${ouId}'
        and psi.eventdatavalues  -> 'csHM60DUGkG' ->> 'value' = '1'
	and psi.eventdatavalues  -> 'UYyCL2xz8Wz' -> 'value' is null