import { FC, useState, useEffect } from 'react';
import { Row, Col, Card, Tag } from 'antd';
import Highcharts from 'highcharts';
import axios, { AxiosResponse } from 'axios';
import { connect } from 'react-redux';

import './CompanyView.css';
import {
  ChartTypes,
  Page,
  Company,
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

const CompanyView: FC<WithUserProps> = ({ user }: WithUserProps) => {
  const [currentGlobalChart, setCurrentGlobalChart] = useState(ChartTypes.BAR);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [pageData, setPageData] = useState<Record<string, Page<Company>>>({});
  const [summaryData, setSummaryData] = useState<Reports>();
  const [reportData, setReportData] = useState<Array<ReportsData>>([]);

  const getPage = (page: number, size: number) => {
    setIsLoadingPage(true);
    if (!pageData[page]) {
      axios
        .request(endPoints.get(resources.COMPANIES, page - 1, size))
        .then((response: AxiosResponse<Page<Company>>) => {
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
      .request(endPoints.reports(['status', 'company']))
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
  }, []); // eslint-disable-line

  return (
    <>
      <SummaryView
        name='Company'
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
        addRoute={
          user.role === UserRole.ADMIN ? '/challenge/companies/new' : ''
        }
      >
        {pageData[currentPage]
          ? pageData[currentPage].content.map(item => {
              return (
                <CardWithChart
                  key={item.id}
                  highcharts={Highcharts}
                  isLoadingReports={isLoadingReports}
                  editRoute={`/challenge/companies/${item.id}`}
                  data={getReportsFromData(
                    filterReportsDataBy(reportData, 'company', item.id),
                  )}
                  currentChart={currentGlobalChart}
                >
                  <Row>
                    <Col span={20}>
                      <Card.Meta title={item.name} description={item.cnpj} />
                    </Col>
                    <Col span={4}>
                      <div className='text-end'>
                        <Tag color={item.active ? 'success' : 'error'}>
                          {item.active ? 'active' : 'inactive'}
                        </Tag>
                      </div>
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

export default connect(mapStateToProps)(CompanyView);
