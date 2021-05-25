import { FC, useState, useEffect } from 'react';
import { Row, Col, Card } from 'antd';
import Highcharts from 'highcharts';
import axios, { AxiosResponse } from 'axios';
import { connect } from 'react-redux';

import './UnitView.css';
import {
  ChartTypes,
  Page,
  Unit,
  Reports,
  ReportsData,
  WithUserProps,
  UserRole,
} from '../../commons';
import {
  getReportsFromData,
  filterReportsDataBy,
  openNotification,
} from '../../utils';
import { SummaryView, CardWithChart } from '../../components';
import { resources, endPoints } from '../../services';
import { RootState } from '../../store';

const UnitView: FC<WithUserProps> = ({ user }: WithUserProps) => {
  const [currentGlobalChart, setCurrentGlobalChart] = useState(ChartTypes.BAR);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [pageData, setPageData] = useState<Record<number, Page<Unit>>>({});
  const [summaryData, setSummaryData] = useState<Reports>();
  const [reportData, setReportData] = useState<Array<ReportsData>>([]);

  const getPage = (page: number, size: number) => {
    setIsLoadingPage(true);
    if (!pageData[page]) {
      axios
        .request(endPoints.get(resources.UNITS, page - 1, size))
        .then((response: AxiosResponse<Page<Unit>>) => {
          if (response && response.status === 200) {
            setPageData({ ...pageData, [page]: response.data });
            setCurrentPage(page);
            setIsLoadingPage(false);
          }
        })
        .catch(error => {
          openNotification({ message: `${error}` }, 'error');
          setIsLoadingPage(false);
        });
    } else {
      setCurrentPage(page);
      setIsLoadingPage(false);
    }
  };

  const getSummary = () => {
    setIsLoadingSummary(true);
    axios
      .request(endPoints.reports())
      .then((response: AxiosResponse<Array<ReportsData>>) => {
        if (response && response.status === 200) {
          setSummaryData(getReportsFromData(response.data));
          setIsLoadingSummary(false);
        }
      })
      .catch(error => {
        openNotification({ message: `${error}` }, 'error');
        setIsLoadingSummary(false);
      });
  };

  const getIndividualReports = () => {
    setIsLoadingReports(true);
    axios
      .request(endPoints.reports(['status', 'unit']))
      .then((response: AxiosResponse<Array<ReportsData>>) => {
        if (response && response.status === 200) {
          setReportData(response.data);
          setIsLoadingReports(false);
        }
      })
      .catch(error => {
        openNotification({ message: `${error}` }, 'error');
        setIsLoadingReports(false);
      });
  };

  const onChangePage = (page: number, size: number) => {
    getPage(page, size);
  };

  const onChangeCurrentChart = (newChart: ChartTypes) => {
    setCurrentGlobalChart(newChart);
  };

  useEffect(() => {
    getPage(currentPage, pageSize);
    getSummary();
    getIndividualReports();
  }, []); //eslint-disable-line

  return (
    <>
      <SummaryView
        name='Unit'
        summaryData={summaryData}
        currentPage={currentPage}
        pageSize={pageSize}
        pageTotal={
          pageData[currentPage] ? pageData[currentPage].total : undefined
        }
        isLoadingContent={isLoadingPage}
        isLoadingSummary={isLoadingSummary}
        onChangePage={onChangePage}
        onChangeCurrentChart={onChangeCurrentChart}
        addRoute={user.role === UserRole.EMPLOYEE ? '' : '/challenge/units/new'}
      >
        {pageData[currentPage]
          ? pageData[currentPage].content.map(item => {
              return (
                <CardWithChart
                  key={item.id}
                  highcharts={Highcharts}
                  isLoadingReports={isLoadingReports}
                  editRoute={
                    user.role === UserRole.EMPLOYEE
                      ? ''
                      : `/challenge/units/${item.id}`
                  }
                  data={getReportsFromData(
                    filterReportsDataBy(reportData, 'unit', item.id),
                  )}
                  currentChart={currentGlobalChart}
                >
                  <Row justify='center'>
                    <Col span={20}>
                      <Card.Meta
                        title={item.name}
                        description={`From company ${item.company}`}
                      />
                    </Col>
                  </Row>
                </CardWithChart>
              );
            })
          : null}
      </SummaryView>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  user: state.user,
});

export default connect(mapStateToProps)(UnitView);
