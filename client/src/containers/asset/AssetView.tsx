import { FC, useState, useEffect } from 'react';
import { Row, Col, Card, Tag, Avatar, Image } from 'antd';
import Highcharts from 'highcharts';
import axios, { AxiosResponse } from 'axios';
import { connect } from 'react-redux';

import './AssetView.css';
import {
  Page,
  Asset,
  Reports,
  UserRole,
  ReportsData,
  WithUserProps,
} from '../../commons';
import { getReportsFromData, openNotification } from '../../utils';
import { SummaryView, CardWithChart } from '../../components';
import { resources, endPoints } from '../../services';
import { RootState } from '../../store';

const AssetView: FC<WithUserProps> = ({ user }: WithUserProps) => {
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [pageData, setPageData] = useState<Record<string, Page<Asset>>>({});
  const [summaryData, setSummaryData] = useState<Reports>();

  const getPage = (page: number, size: number) => {
    setIsLoadingPage(true);
    if (!pageData[page]) {
      axios
        .request(endPoints.get(resources.ASSETS, page - 1, size))
        .then((response: AxiosResponse<Page<Asset>>) => {
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

  const onChangePage = (page: number, size: number) => {
    getPage(page, size);
  };

  const getTagText = {
    inOperation: 'In Operation',
    inAlert: 'In Alert',
    inDowntime: 'In Downtime',
  };

  const getTagColor = {
    inOperation: 'green',
    inAlert: 'volcano',
    inDowntime: 'blue',
  };

  useEffect(() => {
    getPage(currentPage, pageSize);
    getSummary();
  }, []); //eslint-disable-line

  return (
    <>
      <SummaryView
        name='Asset'
        summaryData={summaryData}
        currentPage={currentPage}
        pageSize={pageSize}
        pageTotal={
          pageData[currentPage] ? pageData[currentPage].total : undefined
        }
        isLoadingContent={isLoadingPage}
        isLoadingSummary={isLoadingSummary}
        onChangePage={onChangePage}
        showChartSelectors={false}
        addRoute={
          user.role === UserRole.EMPLOYEE ? '' : '/challenge/assets/new'
        }
      >
        {pageData[currentPage]
          ? pageData[currentPage].content.map(item => {
              return (
                <CardWithChart
                  key={item.id}
                  highcharts={Highcharts}
                  healthChart={true}
                  editRoute={`/challenge/assets/${item.id}`}
                  data={item.healthscore}
                >
                  <Row>
                    <Col span={16}>
                      <Card.Meta
                        avatar={<Avatar src={<Image src={item.image} />} />}
                        title={item.name}
                        description={`S/N: ${item.serialnumber}`}
                      />
                    </Col>
                    <Col span={8}>
                      <div className='text-end'>
                        <Tag
                          color={
                            getTagColor[item.status]
                              ? getTagColor[item.status]
                              : 'red'
                          }
                        >
                          {getTagText[item.status]}
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

export default connect(mapStateToProps)(AssetView);
