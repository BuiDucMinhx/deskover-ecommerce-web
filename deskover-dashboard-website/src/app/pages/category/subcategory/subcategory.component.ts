import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from "rxjs";
import {DataTableDirective} from "angular-datatables";
import {NgbModal, NgbModalConfig} from "@ng-bootstrap/ng-bootstrap";
import {DatePipe} from "@angular/common";
import {UrlUtils} from "@/utils/url-utils";
import {Subcategory} from "@/entites/subcategory";
import {SubcategoryService} from "@services/subcategory.service";
import {CategoryService} from "@services/category.service";
import {AlertUtils} from '@/utils/alert-utils';
import {Category} from "@/entites/category";
import {SubcategoryDto} from "@/dtos/subcategory-dto";

@Component({
  selector: 'app-subcategory',
  templateUrl: './subcategory.component.html',
  styleUrls: ['./subcategory.component.scss'],
  providers: [NgbModalConfig, NgbModal]
})
export class SubcategoryComponent implements OnInit, AfterViewInit, OnDestroy {
  subcategories: Subcategory[];
  subcategory: Subcategory;
  subcategoryDto: SubcategoryDto;

  categories: Category[];

  isEdit: boolean = false;
  isActive: boolean = true;

  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();

  @ViewChild('subcategoryModal') subcategoryModal: any;
  @ViewChild(DataTableDirective, {static: false}) dtElement: DataTableDirective;

  constructor(
    private modalConfig: NgbModalConfig,
    private modalService: NgbModal,
    private subcategoryService: SubcategoryService,
    private categoryService: CategoryService
  ) {
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
    modalConfig.centered = true;

    this.getCategories();
  }

  ngOnInit() {
    const self = this;

    this.dtOptions = {
      pagingType: 'full_numbers',
      language: {
        url: "//cdn.datatables.net/plug-ins/1.12.0/i18n/vi.json"
      },
      lengthMenu: [5, 10, 20, 50, 100],
      responsive: true,
      serverSide: true,
      processing: true,
      stateSave: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.subcategoryService.getByActiveForDatatable(dataTablesParameters, this.isActive).then(resp => {
          self.subcategories = resp.data;
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsFiltered,
            data: self.subcategories
          });
        });
      },
      columns: [
        {title: 'Tên', data: 'name', className: 'align-middle'},
        {title: 'Slug', data: 'slug', className: 'align-middle'},
        {title: 'Danh mục cha', data: 'category.name', className: 'align-middle'},
        {
          title: 'Ngày cập nhật', data: 'modifiedAt', className: 'align-middle text-start text-md-center',
          render: (data, type, full, meta) => {
            return new DatePipe('en-US').transform(data, 'dd/MM/yyyy');
          }
        },
        {title: 'Người cập nhật', data: 'modifiedUser', className: 'align-middle text-start text-md-center'},
        // {
        //   title: 'Trạng thái', data: 'actived', className: 'align-middle text-start text-md-center',
        //   render: (data, type, full, meta) => {
        //     return `<span class="badge bg-${data ? 'success' : 'danger'}">${data ? 'Hoạt động' : 'Vô hiệu hoá'}</span>`;
        //   }
        // },
        {
          title: 'Công cụ',
          data: null,
          orderable: false,
          searchable: false,
          className: 'align-middle text-start text-md-center',
          render: (data, type, full, meta) => {
            if (self.isActive) {
              return `
                <a href="javascript:void(0)" class="btn btn-edit btn-sm bg-faded-info" data-id="${data.id}"
                    title="Sửa" data-toggle="tooltip">
                    <i class="fa fa-pen-square text-info"></i>
                </a>
                <a href="javascript:void(0)" class="btn btn-delete btn-sm bg-faded-danger" data-id="${data.id}"
                    title="Xoá" data-toggle="tooltip">
                    <i class="fa fa-trash text-danger"></i>
                </a>
            `;
            } else {
              return `
               <button type="button" class="btn btn-active btn-sm bg-success" data-id="${data.id}"
                (click)="activeCategory(item.id)"> Kích hoạt </button>`
            }
          }
        },
      ]
    }
  }

  ngAfterViewInit() {
    const self = this;

    this.dtTrigger.next();

    let body = $('body');
    body.on('click', '.btn-edit', function () {
      const id = $(this).data('id');
      self.getSubcategory(id);
    });
    body.on('click', '.btn-delete', function () {
      const id = $(this).data('id');
      self.deleteSubcategory(id);
    });
    body.on('click', '.btn-active', function () {
      const id = $(this).data('id');
      self.activeSubcategory(id);
    });
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }

  filter() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  getCategories() {
    this.categoryService.getByActive().subscribe(data => {
      this.categories = data;
    });
  }

  newSubcategory() {
    this.isEdit = false;
    this.subcategoryDto = <SubcategoryDto>{};
    this.openModal(this.subcategoryModal);
  }

  getSubcategory(id: number) {
    this.subcategoryService.getOne(id).subscribe(data => {
      this.subcategoryDto = this.subcategoryService.convertToDto(data);
    });
    this.isEdit = true;
    this.openModal(this.subcategoryModal);
  }

  saveSubcategory(subcategoryDto: SubcategoryDto) {
    if (!this.isEdit) {
      this.subcategoryService.create(subcategoryDto).subscribe(data => {
        AlertUtils.toastSuccess('Cập nhật thành công');
        this.rerender();
        this.closeModal();
      }, error => {
        AlertUtils.toastError(error);
      });
    } else {
      this.subcategoryService.update(subcategoryDto).subscribe(data => {
        AlertUtils.toastSuccess('Thêm mới thành công');
        this.rerender();
        this.closeModal();
      }, error => {
        AlertUtils.toastError(error);
      });
    }
  }

  deleteSubcategory(id: number) {
    AlertUtils.warning('Xác nhận', 'Danh mục này sẽ bị khoá').then((result) => {
      if (result.value) {
        this.subcategoryService.changeActive(id).subscribe(data => {
          AlertUtils.toastSuccess('Xoá danh mục thành công');
          this.rerender();
        }, error => {
          AlertUtils.toastError(error);
        });
      }
    });
  }

  activeSubcategory(id: number) {
    this.subcategory = this.subcategories.find(item => item.id === id);
    if (!this.subcategory.category.actived) {
      AlertUtils.info('Danh mục cha đã bị khoá', 'Kích hoạt lại danh mục cha?').then((result) => {
        if (result.value) {
          this.categoryService.changeActive(this.subcategory.category.id).subscribe(data => {
            this.changeActive(id);
          });
        }
      });
    } else {
      this.changeActive(id);
    }
  }

  private changeActive(id: number) {
    this.subcategoryService.changeActive(id).subscribe(data => {
      AlertUtils.toastSuccess('Kích hoạt danh mục thành công');
      this.rerender();
    }, error => {
      AlertUtils.toastError(error);
    });
  }

  // Slugify
  toSlug(text: string) {
    return UrlUtils.slugify(text);
  }

  // Modal bootstrap
  openModal(content) {
    this.modalService.dismissAll();
    this.modalService.open(content);
  }

  closeModal() {
    this.modalService.dismissAll();
  }

}
