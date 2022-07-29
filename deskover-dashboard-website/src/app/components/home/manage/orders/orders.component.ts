import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Order, OrderStatus} from "@/entites/order";
import {OrderService} from "@services/order.service";
import {HttpParams} from "@angular/common/http";
import {DataTableDirective} from "angular-datatables";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {environment} from "../../../../../environments/environment";
import {NotiflixUtils} from "@/utils/notiflix-utils";

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: Order[];
  order: Order = null;

  orderStatuses: OrderStatus[];
  orderStatusCode: string = null;

  dtOptions: any = {};

  modalRef?: BsModalRef;

  @ViewChild(DataTableDirective, {static: false}) dtElement: DataTableDirective;
  @ViewChild('orderDetailModal', {static: false}) orderDetailModal: TemplateRef<any>;

  constructor(private orderService: OrderService, private modalService: BsModalService) {
    this.getOrderStatuses();
  }

  ngOnInit(): void {
    const self = this;

    this.dtOptions = {
      pagingType: 'full_numbers',
      language: {
        url: "//cdn.datatables.net/plug-ins/1.12.0/i18n/vi.json"
      },
      serverSide: true,
      processing: true,
      stateSave: true,
      ajax: (dataTablesParameters: any, callback) => {
        const params = new HttpParams().set('statusCode', this.orderStatusCode ? this.orderStatusCode : '');
        this.orderService.getOrdersForDatatables(dataTablesParameters, params).subscribe(resp => {
          self.orders = resp.data;
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsFiltered,
            data: []
          });
        });
      },
      columns: [
        {data: 'orderCode'},
        {data: 'fullName'},
        {data: 'orderDetail.address'},
        {data: 'createdAt'},
        {data: 'modifiedBy'},
        {data: 'orderStatus.status'},
        {data: null, orderable: false, searchable: false}
      ],
      order: [[5, 'asc']],
    }
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,{
        class: 'modal-xl modal-dialog-centered modal-dialog-scrollable',
        backdrop: 'static',
      },
    );
  }

  closeModal() {
    this.modalRef.hide();
  }

  getOrderStatuses(): void {
    this.orderService.getOrderStatuses().subscribe(data => {
      this.orderStatuses = data;
    });
  }

  refreshOrderTable() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }

  setBackgroundByStatus(statusCode: string) {
    if (statusCode.includes('-TC')) {
      return 'bg-opacity-50 text-dark bg-success';
    } else if (statusCode.includes('-TB')) {
      return 'bg-opacity-50 text-dark bg-danger';
    } else if (statusCode.includes('C-')) {
      return 'bg-opacity-50 text-dark bg-warning';
    } else {
      return 'bg-opacity-50 text-dark bg-info';
    }
  }

  openProductPage(productSlug: string) {
    window.open(`${environment.globalUrl.productItem}?p=${productSlug}`, '_blank');
  }

  getOrder(order: Order) {
    this.order = order;
    this.openModal(this.orderDetailModal);
  }

  isPendingOrder(statusCode: string) {
    if(statusCode) {
      return statusCode.includes('C-XN');
    }
  }

  confirmOrder(order: Order) {
    if (order.shipping.shippingId !== 'DKV') {
      this.orderService.confirmOrder(order).subscribe({
        next: (data) => {
          this.orderService.changeOrderStatus(order.orderCode);
          NotiflixUtils.successNotify(data.message);
        },
        error: (err) => {
          console.log(err);
          console.log(JSON.parse(err));
          NotiflixUtils.failureNotify(err.message);
        }
      });
    } else {
      this.orderService.changeOrderStatus(order.orderCode).subscribe({
        next: (data) => {
          NotiflixUtils.successNotify("Đơn hàng đã được xác nhận");
        }
      });
    }
    this.refreshOrderTable();
  }

  cancelOrder(order: Order) {
  }
}
