import { FC, useState, useEffect } from 'react';
import { Card, Avatar, Badge } from 'antd';
import axios, { AxiosResponse } from 'axios';
import { connect } from 'react-redux';

import './UserView.css';
import { Page, User, WithUserProps, UserRole } from '../../commons';
import { SummaryView, CardWithChart } from '../../components';
import { resources, endPoints } from '../../services';
import { openNotification } from '../../utils';
import { RootState } from '../../store';

const UserView: FC<WithUserProps> = ({ user }: WithUserProps) => {
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [pageData, setPageData] = useState<Record<string, Page<User>>>({});

  const getPage = (page: number, size: number) => {
    setIsLoadingPage(true);
    if (!pageData[page]) {
      axios
        .request(endPoints.get(resources.USERS, page - 1, size))
        .then((response: AxiosResponse<Page<User>>) => {
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

  const onChangePage = (page: number, size: number) => {
    getPage(page, size);
  };

  const getTagColor = {
    admin: 'purple',
    manager: 'blue',
    employee: 'green',
  };

  useEffect(() => {
    getPage(currentPage, pageSize);
  }, []); //eslint-disable-line

  return (
    <>
      <SummaryView
        name='User'
        showSummaryChart={false}
        showChartSelectors={false}
        currentPage={currentPage}
        pageSize={pageSize}
        pageTotal={
          pageData[currentPage] ? pageData[currentPage].total : undefined
        }
        isLoadingContent={isLoadingPage}
        onChangePage={onChangePage}
        addRoute={user.role === UserRole.EMPLOYEE ? '' : '/users/new'}
      >
        {pageData[currentPage]
          ? pageData[currentPage].content.map(item => {
              return (
                <Badge.Ribbon
                  color={
                    getTagColor[item.role] ? getTagColor[item.role] : 'red'
                  }
                  key={item.id}
                  text={item.role}
                >
                  <CardWithChart
                    style={{ margin: 0 }}
                    showChart={false}
                    editRoute={
                      user.role === UserRole.EMPLOYEE ? '' : `/users/${item.id}`
                    }
                  >
                    <Card.Meta
                      avatar={
                        <Avatar>
                          {item.name.substring(0, 2).toUpperCase()}
                        </Avatar>
                      }
                      title={item.name}
                      description={item.username}
                    />
                  </CardWithChart>
                </Badge.Ribbon>
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

export default connect(mapStateToProps)(UserView);
